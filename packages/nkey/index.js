'use strict'

const BASE_PROPS = ['pub', 'priv', 'type']

exports.wrap = wrap
exports.wrapAPI = wrapAPI
exports.wrapInstance = wrapInstance
exports.asyncify = asyncify
exports.isPrivateKey = isPrivateKey
exports.isPublicKey = isPublicKey
exports.isSignKey = isSignKey

function wrap (obj) {
  return obj.gen || obj.genSync ? wrapAPI(obj) : wrapInstance(obj)
}

function isPrivateKey (obj) {
  return obj.isPrivateKey
}

function isPublicKey (obj) {
  return !obj.isPrivateKey
}

function isSignKey (obj) {
  return obj.isSignKey
}

function wrapInstance (instance) {
  const wrapper = {}
  Object.keys(instance).forEach(k => {
    if (k === 'signSync' || k === 'verifySync') {
      setReadonly(wrapper, k, instance[k].bind(instance))
      addAsync(wrapper, k === 'signSync' ? 'sign' : 'verify')
    } else if (k === 'toJSON') {
      setReadonly(wrapper, 'toJSON', function () {
        return {
          ...customProps,
          ...instance.toJSON.apply(instance, arguments)
        }
      })
    } else {
      setReadonly(wrapper, k, typeof instance[k] === 'function' ? instance[k].bind(instance) : instance[k])
    }
  })

  setReadonly(wrapper, 'isSignKey', !!wrapper.signSync)

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
        if (!('isPrivateKey' in result)) {
          result.isPrivateKey = true
        }

        return result
      })

      addAsync(wrapper, 'gen')
    } else if (k === 'gen') {
      setReadonly(wrapper, 'gen', function (opts, cb) {
        api[k](opts, function (err, result) {
          if (err) return cb(err)

          if (!('isPrivateKey' in result)) {
            result.isPrivateKey = true
          }

          cb(null, result)
        })
      })
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

        if (!('isPrivateKey' in result)) {
          result.isPrivateKey = !!json.priv
        }

        return result
      })
    } else {
      setReadonly(wrapper, k, typeof api[k] === 'function' ? api[k].bind(api) : api[k])
    }
  })
  setReadonly(wrapper, 'isPrivateKey', isPrivateKey)
  setReadonly(wrapper, 'isPublicKey', isPublicKey)
  setReadonly(wrapper, 'isSignKey', isSignKey)
  setReadonly(wrapper, 'isMyKey', function (key) {
    return key.type === api.type
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
