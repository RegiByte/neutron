import React, { useEffect, useMemo, useReducer, } from 'react';
import rpc from "../../utils/rpc";
import searchBar, { initialState as searchBarInitialState, } from "./states/searchBar";
import statusBar, { initialState as statusBarInitialState, } from "./states/statusBar";
import { bindDispatchToLocalActions, } from "./helpers/redux";
import { actionCreators as searchBarActionCreators, } from "./actions/searchBar";
import { actionCreators as statusBarActionCreators, } from "./actions/statusBar";
import listenPluginMessages from "../../utils/initializePlugin";
import { Container, InputWrapper, MainInput, } from "./styles";
import './styles.global.css';

const App: React.FunctionComponent = () => {
  const [ searchBarState, searchBarDispatch, ] = useReducer(searchBar, searchBarInitialState);
  const [ statusBarState, statusBarDispatch, ] = useReducer(statusBar, statusBarInitialState);

  const searchBarActions = useMemo(() => bindDispatchToLocalActions(searchBarActionCreators, searchBarDispatch), [ searchBarDispatch, ]);
  const statusBarActions = useMemo(() => bindDispatchToLocalActions(statusBarActionCreators, statusBarDispatch), [ statusBarDispatch, ]);

  useEffect(() => {
    rpc.on('showTerm', (newTerm: string) => searchBarActions.setTerm(newTerm));
  }, []);

  return (
    <Container>
      <InputWrapper>
        <MainInput
          value={searchBarState.term}
        />
      </InputWrapper>
    </Container>
  );
};

listenPluginMessages();

export default App;
