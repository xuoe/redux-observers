// These interfaces describe what functionality redux-observers requires from
// redux. They are redefined here so that we don't have to rely on those
// defined upstream, which have incurred some changes since 3.4. Consequently,
// we don't need to import redux; we do so only for testing purposes.
//
// The intent is to export the same type declarations, regardless of the
// changes between redux 3.x and 4.x.
export interface Action<T = any> {
  type: T;
}

export interface AnyAction extends Action {
  [extraProps: string]: any;
}

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T;
}

export interface Store<S = any, A extends Action = AnyAction> {
  dispatch: Dispatch<A>;
  getState(): S;
  subscribe(listener: () => void): Unsubscribe;
}

export interface Unsubscribe {
  (): void;
}
