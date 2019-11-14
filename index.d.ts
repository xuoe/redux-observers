import { Dispatch, Store, Unsubscribe, AnyAction } from 'redux';

export function shallowEquals(a: any, b: any): boolean;

type Options = {
  skipInitialCall?: boolean;
  equals?: typeof shallowEquals;
}

type Mapper<S, MS> = (state: S) => MS;
type Observer<S = any> = (state: S, dispatch: Dispatch<AnyAction>) => void;
type Dispatcher<MS> = (dispatch: Dispatch<AnyAction>, current: MS, previous?: MS) => void;

interface ObserverCreator {
    <S>(dispatcher: Dispatcher<S>, locals?: Options): Observer<S>
    <S, MS>(mapper: Mapper<S, MS>, dispatcher: Dispatcher<MS>, locals?: Options): Observer<S>
}

export const observer: ObserverCreator
export function observe<S>(store: Store<S>, observers: Observer[], globals?: Options): Unsubscribe;
