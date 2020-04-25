import { get, } from 'lodash';

export interface Action<S, A, P> {
  type: keyof A;
  payload?: P;
}

export type Handler<S, A> = (state: S, payload: A) => S

export interface Handlers<T> {
  [key: string]: T;
}

export function reducerFactory<S, A, P>(handlers: Handlers<Handler<S, Action<S, A, P>>>, initialState: S = {} as S): (state: S, action: Action<S, A, P>) => S {
  return function reducer(state = initialState, action): S {
    const handler = get(handlers, action.type) as Handler<S, Action<S, A, P>>;

    if (!handler) return state;

    return handler(state, action) as S;
  };
}

export function action(callback: (payload: any, dispatch: any) => any): (dispatch: any) => any {
  return function dispatcher(dispatch: any): (payload: any) => any {
    return function concreteAction(payload: any): any {
      return callback(payload, dispatch);
    };
  };
}

interface DispatchActions {
  [key: string]: any;
}

export function bindDispatchToLocalActions(actionCreators: DispatchActions, dispatch: any): DispatchActions {
  return Object.entries(actionCreators).reduce((result, [ key, dispatcher, ]: [string, any]) => {
    return {
      ...result,
      [key]: dispatcher(dispatch),
    };
  }, {});
}
