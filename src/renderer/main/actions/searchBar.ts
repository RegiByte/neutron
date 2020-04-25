import { action, } from "../helpers/redux";
import { actions, } from "../states/searchBar";

const reset = action((_, dispatch) => {
  dispatch({
    type: actions.RESET,
  });
});

const updateTerm = action((term, dispatch) => {
  if (!term) {
    reset(dispatch)();
  }

  dispatch({
    type: actions.UPDATE_TERM,
    payload: term,
  });
});

const moveCursor = action((diff, dispatch) => {
  dispatch({
    type: actions.MOVE_CURSOR,
    payload: diff,
  });
});

const selectElement = action((index, dispatch) => {
  dispatch({
    type: actions.SELECT_ELEMENT,
    payload: index,
  });
});

const hideElement = action((id, dispatch) => {
  dispatch({
    type: actions.HIDE_RESULT,
    payload: { id, },
  });
});

const updateElement = action(({ id, result, }, dispatch) => {
  dispatch({
    type: actions.UPDATE_RESULT,
    payload: {
      id,
      result,
    },
  });
});

const changeVisibleElements = action((count, dispatch) => {
  dispatch({
    type: actions.CHANGE_VISIBLE_RESULTS,
    payload: count,
  });
});

export const actionCreators = {
  changeVisibleElements,
  updateElement,
  hideElement,
  moveCursor,
  reset,
  selectElement,
  updateTerm,
};
