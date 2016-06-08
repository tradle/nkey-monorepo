'use strict'

exports.wrap = wrap
exports.asyncify = asyncify

function wrap (api) {
  ;['gen', 'sign', 'verify'].forEach(method => {
    if (!api[method] && api[method + 'Sync']) {
      api[method] = asyncify(api[method + 'Sync'])
    }
  })

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
