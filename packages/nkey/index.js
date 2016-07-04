'use strict'

const clone = require('xtend')
const BASE_PROPS = ['pub', 'priv', 'type']

exports.wrap = wrap
exports.asyncify = asyncify

function wrap (api) {
  ;['gen', 'sign', 'verify'].forEach(method => {
    if (!api[method] && api[method + 'Sync']) {
      api[method] = asyncify(api[method + 'Sync'])
    }
  })

  if (api.sign && !api.set && !api.get) {
    const customProps = {}
    api.set = function (k, v) {
      customProps[k] = v
      return this
    }

    api.get = function (k) {
      return customProps[k]
    }

    const toJSON = api.toJSON
    api.toJSON = function () {
      return clone(customProps, toJSON.apply(this, arguments))
    }
  }

  if (api.fromJSON) {
    const fromJSON = api.fromJSON
    api.fromJSON = function (json) {
      const result = fromJSON.apply(this, arguments)
      if (result.set) {
        Object.keys(json).forEach(k => {
          if (!result[k] && BASE_PROPS.indexOf(k) === -1) {
            result.set(k, json[k])
          }
        })
      }

      return result
    }
  }

  return api
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
