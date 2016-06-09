'use strict'

const clone = require('xtend')

exports.wrap = wrap
exports.asyncify = asyncify

function wrap (api) {
  ;['gen', 'sign', 'verify'].forEach(method => {
    if (!api[method] && api[method + 'Sync']) {
      api[method] = asyncify(api[method + 'Sync'])
    }
  })

  if (api.sign && !api.set) {
    const customProps = {}
    api.set = function (k, v) {
      customProps[k] = v
      return this
    }

    const toJSON = api.toJSON
    api.toJSON = function () {
      return clone(customProps, toJSON.apply(this, arguments))
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
