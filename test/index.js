import { observe, observer } from '../src'
import { createStore } from 'redux'
import tape from 'tape'
import sinon from 'sinon'

const noop = () => {}

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
  fn(current, noop)
  t.notOk(
    spy.called,
    'must not call dispatcher until initial state is set'
  )

  next.forEach(n => {
    spy.reset()
    fn(n, noop)
    t.notOk(
      spy.called,
      'must call dispatcher only when the state changes'
    )
    current = n
  })

  t.end()
})

tape('observer (non-equal states)', t => {
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
  fn(current, noop)
  t.notOk(
    spy.called,
    'must not call dispatcher until initial state is set'
  )

  next.forEach(n => {
    spy.reset()
    fn(n, noop)
    t.ok(
      spy.calledWith(noop, current, n),
      'must call dispatcher with next state'
    )
    current = n
  })

  t.end()
})

tape('observer with custom `equals`', t => {
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
  let fn = observer(state => state, spy, alwaysEqual)

  fn(current, noop)
  t.notOk(
    spy.called,
    'must not call dispatcher until initial state is set'
  )

  states.forEach(next => {
    fn(next, noop)
    t.notOk(spy.called, 'must call dispatcher if `equals` returns true')
    current = next
  })

  const alwaysNotEqual = () => false
  spy.reset()
  fn = observer(state => state, spy, alwaysNotEqual)

  fn(current, noop)
  t.notOk(
    spy.called,
    'must not call dispatcher until initial state is set'
  )

  states.forEach(next => {
    spy.reset()
    fn(next, noop)
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

  fn(current, noop)
  t.notOk(
    spy.called,
    'must not call dispatcher until initial state is set'
  )

  states.forEach(next => {
    spy.reset()
    fn(next, noop)
    t.ok(spy.calledWith(noop, current, next), 'must map values 1:1')
    current = next
  })

  t.end()
})

tape('observe()', t => {

  const TEST = 'TEST'
  function reducer(state = {}, action) {
    if (action.type === TEST) {
      return Object.assign({}, state, action.payload)
    }
    return state
  }

  function testAction(payload) {
    return { type: TEST, payload }
  }

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

  const store = createStore(reducer, {})
  observe(store, ...observers)
  store.dispatch(testAction({ key: 'init' }))

  const tests = [
    {
      key: 'init',
      state: {
        key: 'init'
      }
    },
    {
      key: 'then',
      state: {
        key: 'then',
        a: ['init', 'then'],
        b: ['init', 'then']
      }
    },
    {
      key: { test: 'later' },
      state: {
        key: { test: 'later' },
        a: ['then', { test: 'later' }],
        b: ['then', { test: 'later' }]
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
