import { Dispatch, Store, Unsubscribe } from "./redux";

export function shallowEquals(a: any, b: any): boolean;

export interface Options {
  skipInitialCall?: boolean;
  equals?: typeof shallowEquals;
}

export type Mapper<S, MS> = (state: S) => MS;
export type Observer<S = any> = (state: S, dispatch: Dispatch) => void;
export type Dispatcher<MS> = (
  dispatch: Dispatch,
  current: MS,
  previous?: MS
) => void;

export interface ObserverCreator {
  <S>(dispatcher: Dispatcher<S>, locals?: Options): Observer<S>;
  <S, MS>(
    mapper: Mapper<S, MS>,
    dispatcher: Dispatcher<MS>,
    locals?: Options
  ): Observer<S>;
}

export const observer: ObserverCreator;
export function observe(
  store: Store,
  observers: Observer[],
  globals?: Options
): Unsubscribe;
