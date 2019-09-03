// See https://github.com/xuoe/redux-observers/issues/5
import { Dispatch, Store, Unsubscribe } from 'redux';

export function shallowEquals(a: any, b: any): boolean;

interface Options {
  skipInitialCall?: boolean;
  equals?: typeof shallowEquals;
}

type Observer<S = any, MS = any> = unknown;
type Mapper<S = any, MS = any> = (state: S) => MS;
type Dispatcher<MS> = (dispatch: Dispatch<MS>, currentState: MS, previousState: MS) => unknown;

export function observer<S, MS>(mapper: Mapper<S, MS>, dispatcher: Dispatcher<MS>, options?: Options): Observer<S, MS>;
export function observer<S>(dispatcher: Dispatcher<S>, options?: Options): Observer<S, S>;

export function observe<S>(store: Store<S>, observers: Observer[], options?: Options): Unsubscribe;
