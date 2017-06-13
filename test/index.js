import { observe, observer, shallowEquals } from '../src'
import { createStore } from 'redux'
import tape from 'tape'
import sinon from 'sinon'

const noop = () => {}
const defaultGlobals = {
  equals: shallowEquals,
  skipInitialCall: true
}

const TEST = 'TEST'
const testAction = payload => ({ type: TEST, payload })
const testReducer = () => {
  return (state = {}, action) => {
    if (action.type === TEST) {
      return Object.assign({}, state, action.payload)
    }
    return state
  }
}

tape('shallowEquals()', t => {
  const tests = [
    [false, { a: 'a' }, { b: 'b' }],
    [true, { a: 'a' }, { a: 'a' }],
    [false, { a: 'a' }, { a: 'a', b: 'b' }],
    [true, 'a', 'a'],
    [false, 'a', 'b'],
    [false, 10, 5],
    [false, 10, '5'],
    [true, [1, 2, 3], [1, 2, 3]],
    [false, [1, 2, 3], [1, 2]],
    [true, undefined, undefined],
    [false, true, undefined],
    [true, null, null],
    [false, null, undefined],
    [false, null, ''],
    [false, {}, null]
  ]

  tests.forEach(test => {
    t.equal(test[0], shallowEquals(test[1], test[2]))
  })

  t.end()
})

tape('observer (equal states)', t => {
  const next = [
    {
      a: 'b',
      b: 'c'
    },
    {
      a: 'b',
      b: 'c'
    },
    {
      a: 'b',
      b: 'c'
    }
  ]

  let current = next[0]

  const spy = sinon.spy()
  const fn = observer(state => state, spy)

  fn(current, noop, defaultGlobals)
  next.forEach(n => {
    spy.reset()
    fn(n, noop, defaultGlobals)
    t.notOk(
      spy.called,
      'must call dispatcher when the state changes'
    )
    current = n
  })

  t.end()
})

tape('observer (unequal states)', t => {
  let current = {}
  const next = [
    {
      a: 'a',
      b: 'b',
      c: 'c'
    },
    {
      d: 'd'
    },
    {
      x: 'x',
      y: 'y',
      z: 'z'
    }
  ]

  const spy = sinon.spy()
  const fn = observer(state => state, spy)

  fn(current, noop, defaultGlobals)
  next.forEach(n => {
    spy.reset()
    fn(n, noop, defaultGlobals)
    const previous = current
    current = n
    t.ok(
      spy.calledWith(noop, current, previous),
      'must call dispatcher with next state'
    )
  })

  t.end()
})

tape('observer with user-defined `equals`', t => {
  let current = {}
  const states = [
    {
      a: 'b',
      c: 'd'
    },
    {
      a: 'b',
      c: 'd'
    },
    {
      a: 'b',
      c: 'd'
    }
  ]

  const alwaysEqual = () => true
  const spy = sinon.spy()
  let globals = { equals: alwaysEqual, skipInitialCall: true }
  let fn = observer(state => state, spy)

  fn(current, noop, globals)
  states.forEach(next => {
    fn(next, noop, globals)
    t.notOk(spy.called, 'must not call dispatcher if `equals` returns false')
    current = next
  })

  const alwaysNotEqual = () => false
  globals.equals = alwaysNotEqual
  spy.reset()
  fn = observer(state => state, spy)

  fn(current, noop, globals)
  states.forEach(next => {
    spy.reset()
    fn(next, noop, globals)
    t.ok(spy.called, 'must call dispatcher if `equals` returns true')
  })

  t.end()
})

tape('observer with null mapper', t => {
  let current = {}
  const states = [
    { a: 'b' },
    { c: 'd' }
  ]

  const spy = sinon.spy()
  let fn = observer(null, spy)

  fn(current, noop, defaultGlobals)
  states.forEach(next => {
    spy.reset()
    fn(next, noop, defaultGlobals)
    const previous = current
    current = next
    t.ok(spy.calledWith(noop, current, previous), 'must map values 1:1')
  })

  t.end()
})

tape('observer with null dispatcher', t => {
  t.throws(
    () => observer(null, null),
    /dispatcher/,
    'throws if no `dispatcher` is given'
  )

  t.doesNotThrow(
    () => observer(null, noop),
    "doesn't throws if `dispatcher` given"
  )

  t.end()
})

tape('observe() arguments', t => {
  const validStore = ({
    dispatch: noop,
    getState: noop,
    subscribe: noop
  })

  t.throws(
    () => observe(null, []),
      /expected a Redux store/,
      'throws if `store` object is not provided'
  )

  t.throws(
    () => observe({}, []),
      /expected a Redux store/,
      'throws if `store` object is invalid'
  )

  t.doesNotThrow(
    () => observe(validStore, []),
      "doesn't throw if `store` object is valid"
  )

  t.throws(
    () => observe(validStore, [() => {}]),
      /expected an array/,
      'throws if `observers` array is invalid'
  )

  t.throws(
    () => observe(validStore),
      /expected an array/,
      'throws if `observers` array is absent'
  )

  t.doesNotThrow(
    () => observe(validStore, [observer(null, noop)]),
      "doesn't throw if `observers` array is valid"
  )

  t.end()
})

tape('observe() options', t => {
  let store = createStore(testReducer(), {})
  const spy = sinon.spy()
  const action = testAction('test')
  const reset = () => {
    store = createStore(testReducer(), {})
    spy.reset()
  }

  // Default options.
  observe(store, [observer(null, spy)])
  store.dispatch(action)
  t.equal(spy.callCount, 1, 'uses default options if none provided')

  // Defaults + globals.
  reset()
  observe(store, [observer(null, spy)], { skipInitialCall: false })
  store.dispatch(action)
  t.equal(spy.callCount, 2, 'uses observer-global options if provided')

  // Defaults + globals + locals.
  reset()
  observe(store, [
    observer(null, spy, { skipInitialCall: true })
  ], { skipInitialCall: false })
  store.dispatch(action)
  t.equal(spy.callCount, 1, 'uses observer-local options if provided')

  t.end()
})

tape('integration', t => {

  const keyObserver = key => {
    return observer(
      (state => state.key),
      (dispatch, a, b) => {
        dispatch(testAction({ [key]: [a, b] }))
      }
    )
  }

  const observers = [
    keyObserver('a'),
    keyObserver('b')
  ]

  const store = createStore(testReducer(), {})
  observe(store, observers)
  store.dispatch(testAction({ key: 'init' }))

  const tests = [
    {
      key: 'init',
      state: {
        a: ['init', undefined],
        b: ['init', undefined],
        key: 'init'
      }
    },
    {
      key: 'then',
      state: {
        key: 'then',
        a: ['then', 'init'],
        b: ['then', 'init']
      }
    },
    {
      key: { test: 'later' },
      state: {
        key: { test: 'later' },
        a: [{ test: 'later' }, 'then'],
        b: [{ test: 'later' }, 'then']
      }
    }
  ]

  tests.forEach(test => {
    store.dispatch(testAction({ key: test.key }))
    t.deepEqual(
      store.getState(), test.state,
      'dispatches actions in the correct order'
    )
  })

  t.end()
})
