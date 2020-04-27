import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState, } from 'react';
import rpc from "../../utils/rpc";
import searchBar, {
  initialState as searchBarInitialState,
  Result,
  SearchBarInitialState,
} from "./states/searchBar";
import statusBar, { initialState as statusBarInitialState, } from "./states/statusBar";
import { bindDispatchToLocalActions, } from "./helpers/redux";
import { actionCreators as searchBarActionCreators, } from "./actions/searchBar";
import { actionCreators as statusBarActionCreators, } from "./actions/statusBar";
import listenPluginMessages from "../../utils/initializePlugin";
import { Autocomplete, Container, InputWrapper, MainInput, StatusBar, } from "./styles";
import './styles.global.css';
import ResultsList from "./components/ResultsList";
import { debounce, flowRight, } from 'lodash';
import { clipboard, remote, } from 'electron';
import { INPUT_HEIGHT, MIN_VISIBLE_RESULTS, RESULT_HEIGHT, WINDOW_WIDTH, } from "../../constants/ui";
import {
  ARROW_DOWN_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  C_KEY,
  ENTER_KEY,
  ESC_KEY,
  J_KEY,
  K_KEY,
  L_KEY,
  NINE_KEY,
  O_KEY,
  ONE_KEY,
  SPACE_KEY,
  TAB_KEY,
} from "./constants/keycodes";
import { cursorIsEndOfInput, focusPreview, } from "./helpers/input";
import { escapeStringRegexp, } from "./helpers/regex";
import { getWindowPosition, } from "../../utils/window";

const App: React.FunctionComponent = () => {
  const electronWindowRef = useRef(remote.getCurrentWindow());
  const [ mainInputFocused, setMainInputFocused, ] = useState(false);
  const [ searchBarState, searchBarDispatch, ] = useReducer(searchBar, searchBarInitialState);
  const [ statusBarState, statusBarDispatch, ] = useReducer(statusBar, statusBarInitialState);
  const inputRef = useRef(null);

  const searchBarActions = useMemo(() => bindDispatchToLocalActions(searchBarActionCreators, searchBarDispatch), [ searchBarDispatch, ]);
  const statusBarActions = useMemo(() => bindDispatchToLocalActions(statusBarActionCreators, statusBarDispatch), [ statusBarDispatch, ]);

  const onWindowResize = useCallback(() => {
    return searchBarActions.changeVisibleResults(({ resultIds, visibleResults, ...state }: SearchBarInitialState): SearchBarInitialState => {
      if (resultIds.length <= MIN_VISIBLE_RESULTS) {
        return {
          ...state,
          resultIds,
          visibleResults,
        } as SearchBarInitialState;
      }

      const newVisibleResults = (flowRight(
        () => Math.floor((window.outerHeight - INPUT_HEIGHT) / RESULT_HEIGHT),
        (visible) => Math.max(MIN_VISIBLE_RESULTS, visible)
      ) as () => number)();

      if (visibleResults !== newVisibleResults) {
        return {
          ...state,
          resultIds,
          visibleResults: newVisibleResults,
        } as SearchBarInitialState;
      }
    });
  }, []);

  const onDocumentKeydown = useCallback((event: KeyboardEvent) => {
    if (Number(event.code) === SPACE_KEY) {
      event.preventDefault();
      inputRef.current && inputRef.current.focus();
    }
  }, [ inputRef, ]);

  const onCleanup = useCallback(() => {
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('beforeunload', onCleanup);
    if (electronWindowRef.current) {
      electronWindowRef.current.removeListener('show', focusMainInput);
      electronWindowRef.current.removeListener('show', updateElectronWindow);
    }
  }, []);


  const selectItemCallback = useCallback((item, realEvent = {} as KeyboardEvent) => {
    searchBarActions.reset();
    const event = realEvent;

    if (event.preventedDefault) {
      electronWindowRef.current && electronWindowRef.current.hide();
    }

    item.onSelect && item.onSelect(event);
  }, [ searchBarActions, ]);

  const results = useMemo<Result[]>((): Result[] => {
    return searchBarState.resultIds.map(id => {
      return searchBarState.resultsById[id];
    });
  }, [ searchBarState.resultIds, searchBarState.resultsById, ]);

  const highlightedResult = useMemo<Result>((): Result => {
    return results[searchBarState.selected];
  }, [ results, searchBarState, searchBarState.selected, ]);

  const autocomplete = useCallback((event) => {
    console.log('autocomplete', event);
  }, []);

  const selectCurrentItem = useCallback(event => {
    selectItemCallback(highlightedResult, event);
  }, []);

  const autocompleteValue = useMemo(() => {
    if (highlightedResult && highlightedResult.term) {
      const regexp = new RegExp(`^${escapeStringRegexp(searchBarState.term)}`, 'i');
      if (highlightedResult.term.match(regexp)) {
        return highlightedResult.term.replace(regexp, searchBarState.term);
      }
    }

    return '';
  }, [ searchBarState, highlightedResult, ]);

  const onKeyDown = useCallback((event: any) => {
    if (event.preventedDefault) {
      return;
    }

    const keyActions = {
      select: (): void => selectCurrentItem(event),
      arrowUp: (): void => {
        if (searchBarState.resultIds.length > 0) {
          searchBarActions.moveCursor(-1);
        } else if (searchBarState.prevTerm) {
          searchBarActions.updateTerm(searchBarState.prevTerm);
        }
      },
      arrowDown: (): void => {
        searchBarActions.moveCursor(1);
      },
      arrowRight: (): void => {
        if (cursorIsEndOfInput(event.target)) {
          if (autocompleteValue) {
            autocomplete(event);
          } else {
            focusPreview();
            event.preventDefault();
          }
        }
      },
    };


    const keyCode = Number(event.keyCode);

    if (event.metaKey || event.ctrlKey) {
      if (keyCode === C_KEY) {
        const text = 'highlightedResult.clipboard'; // TODO: fix clipboard
        if (text) {
          clipboard.writeText(text);
          searchBarActions.reset();
        }
        return;
      }

      if (keyCode >= ONE_KEY && keyCode <= NINE_KEY) {
        const number = Math.abs(49 - keyCode);
        const result = results[number];
        if (result) {
          selectItemCallback(result);
        }
      }

      switch (keyCode) {
      case J_KEY:
        keyActions.arrowDown();
        break;
      case K_KEY:
        keyActions.arrowUp();
        break;
      case L_KEY:
        keyActions.arrowRight();
        break;
      case O_KEY:
        keyActions.select();
        break;
      }
    }

    interface Handlers {
      [key: string]: () => void;
    }

    const handlers: Handlers = {
      [TAB_KEY]: (): void => autocomplete(event),
      [ARROW_RIGHT_KEY]: (): void => keyActions.arrowRight(),
      [ARROW_DOWN_KEY]: (): void => keyActions.arrowDown(),
      [ARROW_UP_KEY]: (): void => keyActions.arrowUp(),
      [ENTER_KEY]: (): void => keyActions.select(),
      [ESC_KEY]: (): void => {
        searchBarActions.reset();
        electronWindowRef && electronWindowRef.current.hide();
      },
    };

    if (handlers[keyCode]) {
      handlers[keyCode]();
    }

  }, [ searchBarState, searchBarActions, highlightedResult, ]);

  const onMainInputFocus = useCallback(() => {
    setMainInputFocused(true);
  }, [ setMainInputFocused, ]);

  const onMainInputBlur = useCallback(() => {
    setMainInputFocused(false);
  }, [ setMainInputFocused, ]);

  const focusMainInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [ inputRef, ]);

  const updateElectronWindow = useCallback(() => {
    const { visibleResults, } = searchBarState;
    const { length, } = results;
    const win = electronWindowRef.current;
    if (!win) return;
    const [ width, ] = win.getSize();

    win.resizable = length !== 0;

    if (length === 0) {
      win.setMinimumSize(WINDOW_WIDTH, INPUT_HEIGHT);
      win.setSize(width, INPUT_HEIGHT);
      win.setPosition(...getWindowPosition({ width, }));
      return;
    }

    const resultHeight = Math.max(Math.min(visibleResults, length), MIN_VISIBLE_RESULTS);
    const heightWithResults = resultHeight * RESULT_HEIGHT + INPUT_HEIGHT;
    const minHeightWithResults = MIN_VISIBLE_RESULTS * RESULT_HEIGHT + INPUT_HEIGHT;
    win.setMinimumSize(WINDOW_WIDTH, minHeightWithResults);
    win.setSize(width, heightWithResults);
    win.setPosition(...getWindowPosition({ width, heightWithResults, }));
  }, [ results, searchBarState.visibleResults, ]);

  useEffect(() => {
    console.log('mounted');
    const showTermCallback = (newTerm: string) => searchBarActions.setTerm(newTerm);
    rpc.on('showTerm', showTermCallback);

    window.addEventListener('resize', debounce(onWindowResize, 100));
    window.addEventListener('keydown', onDocumentKeydown);

    window.addEventListener('beforeunload', onCleanup);

    electronWindowRef.current.on('show', focusMainInput);
    electronWindowRef.current.on('show', updateElectronWindow);

    return () => {
      console.log('unmounted');
      rpc.off('showTerm', showTermCallback);
    };
  }, []);

  const onChangeTerm = useCallback((event) => {
    searchBarActions.updateTerm(event.target.value);
  }, [ searchBarActions, ]);

  console.log(results);

  return (
    <Container>
      {autocompleteValue && (
        <Autocomplete>{autocompleteValue}</Autocomplete>
      )}
      <InputWrapper>
        <MainInput
          value={searchBarState.term}
          onChange={onChangeTerm}
          ref={inputRef.current}
          onKeyDown={onKeyDown}
          onBlur={onMainInputBlur}
          onFocus={onMainInputFocus}
        />
      </InputWrapper>
      <ResultsList
        selected={searchBarState.selected}
        visibleResults={searchBarState.visibleResults}
        onItemHover={searchBarActions.selectElement}
        onSelect={selectItemCallback}
        mainInputFocused={mainInputFocused}
        results={results}
      />
      {statusBarState.text && (
        <StatusBar>
          {statusBarState.text}
        </StatusBar>
      )}
    </Container>
  );
};

listenPluginMessages();

export default App;
