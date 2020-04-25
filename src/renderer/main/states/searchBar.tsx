import { Action, Handler, Handlers, reducerFactory, } from "../helpers/redux";
import { MIN_VISIBLE_RESULTS, } from "../../../constants/ui";
import { orderBy, uniq, } from 'lodash';

function normalizeSelection(index: number, length: number): number {
  const normalizedIndex = index % length;
  return normalizedIndex < 0 ? length + normalizedIndex : normalizedIndex;
}

const noon = (): void => null;

interface Result {
  onFocus: () => any;
  onBlur: () => any;
  onSelect: () => any;
  id: string;
  order: number;
}

function normalizeResult(result: Result): Result {
  return {
    ...result,
    onFocus: result.onFocus || noon,
    onBlur: result.onBlur || noon,
    onSelect: result.onSelect || noon,
  };
}

interface Actions {
  UPDATE_TERM: string;
  MOVE_CURSOR: string;
  SELECT_ELEMENT: string;
  SHOW_RESULT: string;
  HIDE_RESULT: string;
  UPDATE_RESULT: string;
  RESET: string;
  CHANGE_VISIBLE_RESULTS: string;
  SET_STATUS_BAR_TEXT: string;
}

export const actions: Actions = {
  UPDATE_TERM: 'UPDATE_TERM',
  MOVE_CURSOR: 'MOVE_CURSOR',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  SHOW_RESULT: 'SHOW_RESULT',
  HIDE_RESULT: 'HIDE_RESULT',
  UPDATE_RESULT: 'UPDATE_RESULT',
  RESET: 'RESET',
  CHANGE_VISIBLE_RESULTS: 'CHANGE_VISIBLE_RESULTS',
  SET_STATUS_BAR_TEXT: 'SET_STATUS_BAR_TEXT',
};

type UpdateTermPayload = string
type MoveCursorPayload = number
type SelectElementPayload = number
type UpdateResultPayload = {
  id: string;
  result: object;
}
type HideResultPayload = {
  id: string;
}
type ShowResultPayload = {
  term: string;
  result: Result[];
}
type ChangeVisibleResultsPayload = number

interface ResultsById {
  [key: string]: Result;
}

interface InitialState {
  term: string;
  prevTerm: string;
  resultIds: string[];
  resultsById: ResultsById;
  selected: number;
  visibleResults: number;
}


export const initialState: InitialState = {
  prevTerm: '',
  term: '',
  resultIds: [],
  resultsById: {},
  selected: 0,
  visibleResults: MIN_VISIBLE_RESULTS,
};

type Payload =
  UpdateTermPayload
  | MoveCursorPayload
  | SelectElementPayload
  | UpdateResultPayload
  | HideResultPayload
  | ShowResultPayload
  | ChangeVisibleResultsPayload

const handlers: Handlers<Handler<InitialState,
  Action<InitialState,
    Actions,
    Payload>>> = {};

handlers[actions.UPDATE_TERM] = (state, { payload, }: Action<InitialState, Actions, UpdateTermPayload>): InitialState => {
  return {
    ...state,
    term: payload,
    resultIds: [],
    selected: 0,
  };
};

handlers[actions.MOVE_CURSOR] = (state, action: Action<InitialState, Actions, MoveCursorPayload>): InitialState => {
  const { payload, } = action;
  return ({
    ...state,
    selected: normalizeSelection(state.selected + payload, state.resultIds.length),
  });
};

handlers[actions.SELECT_ELEMENT] = (state, action: Action<InitialState, Actions, SelectElementPayload>): InitialState => ({
  ...state,
  selected: normalizeSelection(action.payload, state.resultIds.length),
});

handlers[actions.UPDATE_RESULT] = (state, action: Action<InitialState, Actions, UpdateResultPayload>): InitialState => {
  const { payload, } = action;
  const { resultsById, } = state;
  const { id, result, } = payload;
  const newResult = {
    ...resultsById[id],
    ...result,
  };
  return ({
    ...state,
    resultsById: {
      ...state.resultsById,
      [id]: newResult,
    },
  });
};

handlers[actions.HIDE_RESULT] = (state, action: Action<InitialState, Actions, HideResultPayload>): InitialState => {
  const { id, } = action.payload;
  const { resultsById: originalResultsById, resultIds: originalResultIds, } = state;
  const resultIds = originalResultIds.filter((resultId: string) => resultId !== id);
  const resultsById = resultIds.reduce<ResultsById>((acc, resultId): ResultsById => {
    return {
      ...acc,
      [resultId]: originalResultsById[resultId],
    };
  }, {});

  return {
    ...state,
    resultsById,
    resultIds,
  };
};

handlers[actions.SHOW_RESULT] = (state, action: Action<InitialState, Actions, ShowResultPayload>): InitialState => {
  const { term, result, } = action.payload;

  if (term !== state.term) {
    return state;
  }

  const { resultsById: originalResultsById, resultIds: originalResultIds, } = state;

  const resultIds: string[] = [ ...originalResultIds, ...result.map(res => res.id), ];
  const resultsById: ResultsById = {
    ...originalResultsById,
    ...result.reduce((results, res) => {
      return {
        ...results,
        [res.id]: normalizeResult(res),
      };
    }, {}),
  };

  return {
    ...state,
    resultIds: orderBy(uniq(resultIds), (id: string) => resultsById[id].order || 0),
    resultsById,
  };
};

handlers[actions.CHANGE_VISIBLE_RESULTS] = (state, action: Action<InitialState, Actions, ChangeVisibleResultsPayload>): InitialState => {
  const { payload, } = action;

  return {
    ...state,
    visibleResults: payload,
  };
};

handlers[actions.RESET] = (state): InitialState => {
  return {
    ...initialState,
    prevTerm: state.term || state.prevTerm,
  };
};


export default reducerFactory<InitialState, Actions, Payload>(handlers, initialState);
