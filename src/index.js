export function observe(store, ...observers) {
  const { dispatch, getState, subscribe } = store
  const apply = state => { observers.forEach(fn => { fn(state, dispatch) }) }
  const listen = () => { apply(getState()) }

  const unsubscribe = subscribe(listen)
  listen()
  return unsubscribe
}

export function observer(mapper, dispatcher, equals) {
  mapper = mapper || defaultMapper
  dispatcher = dispatcher || defaultDispatcher
  equals = equals || defaultEquals

  let current
  return (state, dispatch) => {
    const next = mapper(state)

    if (typeof current === 'undefined') {
      current = next
      return
    }

    if (!equals(current, next)) {
      const prev = current
      current = next
      dispatcher(dispatch, prev, next)
    }
  }
}

const defaultMapper = state => state
const defaultDispatcher = () => {}
const defaultEquals = shallowEqual

// Adapted from https://github.com/rackt/react-redux/blob/master/src/utils/shallowEqual.js
function shallowEqual(a, b) {
  if (a === b) {
    return true
  }

  const [aKeys, bKeys] = [Object.keys(a), Object.keys(b)]
  if (aKeys.length !== bKeys.length) {
    return false
  }

  for (let i = 0; i < bKeys.length; i++) {
    let key = bKeys[i]
    if (!has.call(a, key) || a[key] !== b[key]) {
      return false
    }
  }

  return true
}

const has = Object.prototype.hasOwnProperty
