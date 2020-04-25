import { action, } from "../helpers/redux";
import { actions, } from "../states/statusBar";

const reset = action((_, dispatch) => {
  dispatch({
    type: actions.SET_STATUS_BAR_TEXT,
    payload: null,
  });
});

const setValue = action((text, dispatch) => {
  dispatch({
    type: actions.SET_STATUS_BAR_TEXT,
    payload: text,
  });
});

export const actionCreators = {
  reset,
  setValue,
};

