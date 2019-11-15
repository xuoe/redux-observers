import { createStore, Dispatch, Store, Action } from "redux-4";
import { observer, observe, Dispatcher, Mapper } from "redux-observers";

const reducer = (state: any, action: Action) => {};
const store: Store = createStore(reducer);
const { dispatch } = store;

const mapper: Mapper<any, any> = (state: any) => {};
const dispatcher: Dispatcher<any> = (dispatch: Dispatch<Action>, current: {}, previous?: {}) => {};

// $ExpectError
dispatcher({}, {}, {});

dispatcher(dispatch, {}, {});

// $ExpectType Observer<any>
observer(mapper, dispatcher);

// $ExpectType Observer<any>
observer(dispatcher, {});

// $ExpectType Observer<any>
observer(dispatcher);

// $ExpectType Unsubscribe
observe(store, [observer(dispatcher)]);

// $ExpectError
observe(store, [observer(dispatcher)], { equals: false });

// $ExpectType Unsubscribe
observe(store, [observer(dispatcher)], { skipInitialCall: true });
