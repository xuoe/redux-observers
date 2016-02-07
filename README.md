# redux-observers

[![Build Status](https://img.shields.io/travis/xuoe/redux-observers.svg?style=flat-square)](https://travis-ci.org/xuoe/redux-observers)
[![Coverage Status](https://img.shields.io/coveralls/xuoe/redux-observers.svg?style=flat-square)](https://coveralls.io/r/xuoe/redux-observers)
[![NPM Version](https://img.shields.io/npm/v/redux-observers.svg?style=flat-square)](https://www.npmjs.com/package/redux-observers)

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
  (dispatch, prev, current) => {
    expect(prev).to.be.ok()
    expect(current).to.not.eql(prev)
    dispatch({ type: 'SLICE_CHANGE', payload: {...} })
  }
)

observe(store, myObserver, ...otherObservers)
```

That's it.

## API

#### `observer([mapper], [dispatcher], [equals]) => observerFunc`

Creates an observer.

  - `mapper(state) => mappedState` *(Function)*

    Specifies which state slice(s) should be observed by returning a plain
    object (or any other value) extracted from the store's state. It is similar
    in vein to `mapStateToProps()` provided by `react-redux`.

    If no `mapper` is provided, the entire store state is mapped by default.

  - `dispatcher(dispatch, previousState, currentState)` *(Function)*

    Called whenever the mapped-over state changes.

  - `equals(previousState, currentState) => Boolean` *(Function)*

    Specifies how the previous state should be compared with the current one. Its
    return value must be a Boolean, which is used to determine whether `dispatcher`
    should be called. Note that, by default, values are compared in a shallow manner,
    which suffices for most use cases.


_Note that if care is not exercised, infinite cycles may be created between
a `mapper` and a `dispatcher`._

####  `observe(store, ...observers)`

Listens for `store` updates and applies given `observers` over the `store` state.
