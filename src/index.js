import _ from './helpers'
import { SKIP, EQUALS, OBSERVER } from './constants'

// Default options.
const defaults = {
  [SKIP]: true,
  [EQUALS]: shallowEquals
}

export function observe(store, observers, options = {}) {
  if (!_.isStore(store)) {
    throw new Error(
      'observers: invalid `store` argument; ' +
      'expected a Redux store object.'
    )
  }

  if (!_.isObserverArray(observers)) {
    throw new Error(
      'observers: invalid `observers` argument; ' +
      'expected an array of observer() functions.'
    )
  }

  // Create globally-applicable options for the given observer set.
  const globals = [SKIP, EQUALS].reduce((globals, key) => {
    globals[key] = _.hasKey(options, key)
      ? options[key]
      : defaults[key]
    return globals
  }, {})

  const { dispatch, getState, subscribe } = store
  const apply = state => {
    observers.forEach(fn => { fn(state, dispatch, globals) })
  }
  const listen = () => { apply(getState()) }

  const unsubscribe = subscribe(listen)
  listen()
  return unsubscribe
}

export function observer(mapper, dispatcher, locals = {}) {
  mapper = mapper || defaultMapper
  if (typeof dispatcher !== 'function') {
    throw new Error('observers: a `dispatcher` function must be provided.')
  }

  let initialized = false
  let current
  const observer = function (state, dispatch, options = {}) {
    const previous = current
    current = mapper(state)

    // This branch is run only once, before the Redux reducers
    // return their initial state.
    if (!initialized) {
      initialized = true
      const skip = _.hasKey(locals, SKIP) ? !!locals[SKIP] : options[SKIP]
      if (skip) {
        return
      }
    }

    const equals = locals[EQUALS] || options[EQUALS]
    if (!equals(current, previous)) {
      dispatcher(dispatch, current, previous)
    }
  }

  observer[OBSERVER] = true
  return observer
}

const defaultMapper = state => state

// Adapted from https://github.com/rackt/react-redux/blob/master/src/utils/shallowEqual.js
export function shallowEquals(a, b) {
  if (a === b) {
    return true
  }

  if (_.isPrimitive(a) || _.isPrimitive(b)) {
    return a === b
  }

  const [aKeys, bKeys] = [Object.keys(a), Object.keys(b)]
  if (aKeys.length !== bKeys.length) {
    return false
  }

  for (let i = 0; i < bKeys.length; i++) {
    let key = bKeys[i]
    if (!_.hasKey(a, key) || a[key] !== b[key]) {
      return false
    }
  }

  return true
}
