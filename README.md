# redux-observers

[![Build Status](https://img.shields.io/travis/xuoe/redux-observers.svg?style=flat-square)](https://travis-ci.org/xuoe/redux-observers)
[![Coverage Status](https://img.shields.io/coveralls/xuoe/redux-observers.svg?style=flat-square)](https://coveralls.io/r/xuoe/redux-observers)
[![NPM Version](https://img.shields.io/npm/v/redux-observers.svg?style=flat-square)](https://www.npmjs.com/package/redux-observers)

Observe [Redux](http://redux.js.org/) state changes and dispatch actions on change.

## Installation

Assuming you're using `npm` and a module bundler capable of consuming CommonJS
modules:

`npm install --save redux-observers`

## Usage
First, create a `store` object as you normally would, then create the necessary
observers and pass them as arguments to `observe()`:

```javascript
import { observer, observe } from 'redux-observers'

const myObserver = observer(
  state => state.slice.of.interest,
  (dispatch, current, previous) => {
    expect(previous).to.be.ok()
    expect(current).to.not.eql(previous)
    dispatch({ type: 'SLICE_CHANGE', payload: {...} })
  }
)

observe(store, [myObserver, ...myOtherObservers])
```

That's the gist of it.

## API

#### `observer([mapper], dispatcher, [options]) => observerFunc`

Creates an observer.

  - `mapper(state) => mappedState` *(Function)*

    Specifies which state slice(s) should be observed by returning a plain
    object (or any other value) extracted from the store's state. It is similar
    in vein to `mapStateToProps()` provided by `react-redux`.

    If no `mapper` is provided, the entire store state is mapped by default.

  - `dispatcher(dispatch, currentState, [previousState])` *(Function)*

    Called whenever the mapped-over state changes. Note that `previousState`
    may be omitted from the `dispatcher` signature if desired.

  - `options` *(Object)*

    A local options object, whose values are applicable only in the context of
    the returned `observerFunc`. Any option provided here takes precedence over
    its [global](#observestore-observers-options--unsubscribefunc)
    and [default](#options) equivalents.

_Note that if care is not exercised, infinite cycles may be created between
a `mapper` and a `dispatcher`._

#### `observe(store, observers, [options]) => unsubscribeFunc`

Listens for `store` updates and applies given `observers` over the `store`
state.

 - `store` *(Object)*

    The Redux store object.

 - `observers` *(Array)*

    An array of (observer) functions, where each member must be the result of
    calling `observer()`.

 - `options` *(Object)*

    A global options object, whose values are applicable only in the context
    of the provided `observers` (i.e., `observe()`ing a `store` multiple times
    using the same `observers`, but providing different global options, results
    in a different behavior, as prescribed by that `options` object). Any option
    provided here takes precedence over [its default value](#options).

##### Options

  A plain object that may be provided to `observe(,, options)` to describe how
  a set of observers must behave, or to `observer(,, options)` to describe how
  a particular observer must behave.

  - `skipInitialCall` *(Boolean, defaults to `true`)*

    Specifies whether dispatchers must be called immediately after Redux
    dispatches its `@@redux/INIT` action.

    If set to `false`, dispatchers are initially called with an `undefined`
    "previous" state; otherwise, and by default, a dispatcher is only called
    after the "previous" state is set (i.e., after `@@redux/INIT` is
    dispatched and the store's reducers had a chance to return their initial
    state).

  - `equals: (currentState, previousState) => Boolean` *(Function, defaults to `shallowEquals`)*

    Specifies how the previous state should be compared with the current one. Its
    return value must be a Boolean, which is used to determine whether a dispatcher
    should be called. Note that, by default, values are compared in a shallow
    manner via [`shallowEquals()`](#shallowequalsa-b--boolean), which should
    satisfy most use cases.

#### `shallowEquals(a, b) => Boolean`

The default comparsion helper used by observers to determine whether two
mapped-over values (be they plain objects or primitive values) are equal.
