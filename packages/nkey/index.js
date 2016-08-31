'use strict'

const clone = require('xtend')
const BASE_PROPS = ['pub', 'priv', 'type']

exports.wrap = wrap
exports.wrapAPI = wrapAPI
exports.wrapInstance = wrapInstance
exports.asyncify = asyncify

function wrap (obj) {
  return obj.gen || obj.genSync ? wrapAPI(obj) : wrapInstance(obj)
}

function wrapInstance (instance) {
  const wrapper = {}
  Object.keys(instance).forEach(k => {
    if (k === 'signSync' || k === 'verifySync') {
      setReadonly(wrapper, k, instance[k].bind(instance))
      addAsync(wrapper, k === 'signSync' ? 'sign' : 'verify')
    } else if (k === 'toJSON') {
      setReadonly(wrapper, 'toJSON', function () {
        return clone(customProps, instance.toJSON.apply(instance, arguments))
      })
    } else {
      setReadonly(wrapper, k, typeof instance[k] === 'function' ? instance[k].bind(instance) : instance[k])
    }
  })

  const customProps = {}
  setReadonly(wrapper, 'set', function (k, v) {
    customProps[k] = v
    return this
  })

  setReadonly(wrapper, 'get', function (k) {
    return customProps[k]
  })

  return wrapper
}

function wrapAPI (api) {
  const wrapper = {}
  Object.keys(api).forEach(k => {
    if (k === 'genSync') {
      setReadonly(wrapper, 'genSync', function () {
        const result = api[k].apply(api, arguments)
        result.isPrivateKey = true
        return result
      })

      addAsync(wrapper, 'gen')
    } else if (k === 'fromJSON') {
      setReadonly(wrapper, 'fromJSON', function (json) {
        const result = api.fromJSON.apply(api, arguments)
        if (result.set) {
          Object.keys(json).forEach(k => {
            if (!result[k] && BASE_PROPS.indexOf(k) === -1) {
              result.set(k, json[k])
            }
          })
        }

        result.isPrivateKey = !!json.priv
        return result
      })
    } else {
      setReadonly(wrapper, k, typeof api[k] === 'function' ? api[k].bind(api) : api[k])
    }
  })

  return wrapper
}

function asyncify (fn) {
  return function asyncified () {
    const args = [].slice.call(arguments)
    const cb = args.pop()
    let result
    try {
      result = fn.apply(null, args)
    } catch (err) {
      return process.nextTick(() => cb(err))
    }

    process.nextTick(() => cb(null, result))
  }
}

function addAsync (obj /* methods */) {
  [].slice.call(arguments, 1).forEach(method => {
    if (!obj[method] && obj[method + 'Sync']) {
      setReadonly(obj, method, asyncify(obj[method + 'Sync']))
    }
  })
}

function setReadonly (obj, k, v) {
  Object.defineProperty(obj, k, {
    enumerable: true,
    writable: false,
    value: v
  })
}
