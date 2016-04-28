import { OBSERVER } from './constants'

export default {
  isStore, isObserverArray, isPrimitive, hasKey
}

const storeKeys = ['dispatch', 'getState', 'subscribe']
function isStore(val) {
  if (!val) {
    return false
  }
  return storeKeys.every(key => has.call(val, key))
}

function isObserverArray(val) {
  if (!Array.isArray(val)) {
    return false
  }
  return val.every(isObserver)
}

function isObserver(val) {
  return typeof val === 'function' && val[OBSERVER]
}

const primitives = ['string', 'number', 'boolean']
function isPrimitive(val) {
  return primitives.some(p => typeof val === p)
}

const has = Object.prototype.hasOwnProperty
function hasKey(obj, key) {
  return has.call(obj, key)
}

