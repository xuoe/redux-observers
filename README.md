# redux-observers
This package allows you to subscribe to state changes and optionally dispatch
actions whenever a change occurs.

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

That's it. Now, observe.

## API

#### `observer([mapper], [dispatcher], [equals]) => observerFunc`

> Creates an observer.

  - `mapper(state) => mappedState` *(Function)*

    Specifies which state slice(s) should be observed by returning a plain
    object (or any other value) extracted from the store's state. It is similar
    in vein to `mapStateToProps()` provided by `react-redux`.

  - `dispatcher(dispatch, previousState, currentState)` *(Function)*

    Called whenever the mapped-over state changes.

  - `equals(previousState, currentState) => Boolean` *(Function)*

    Specifies how the previous state should be compared with the current one. Its
    return value must be a Boolean, which is used to determine whether `dispatcher`
    should be called. Note that, by default, values are compared shallowly,
    which suffices for most cases.

####  `observe(store, ...observers)`

> Listens for `store` updates and applies given `observers`.
