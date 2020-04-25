import { Action, Handler, Handlers, reducerFactory, } from "../helpers/redux";

interface Actions {
  SET_STATUS_BAR_TEXT: string;
}

export const actions: Actions = {
  SET_STATUS_BAR_TEXT: 'SET_STATUS_BAR_TEXT',
};

interface InitialState {
  text: string;
}

export const initialState: InitialState = {
  text: '',
};

type SetStatusBarTextPayload = string

type Payload = SetStatusBarTextPayload

const handlers: Handlers<Handler<InitialState, Action<InitialState, Actions, Payload>>> = {};

handlers[actions.SET_STATUS_BAR_TEXT] = (state, action: Action<InitialState, Actions, SetStatusBarTextPayload>): InitialState => ({
  ...state,
  text: action.payload,
});

export default reducerFactory<InitialState, Actions, Payload>(handlers, initialState);
