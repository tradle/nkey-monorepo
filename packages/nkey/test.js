
const crypto = require('crypto')
const test = require('tape')
const extend = require('xtend')
const typeforce = require('typeforce')
const types = require('./types')
const utils = require('./')
const sha256 = function (data) {
  return crypto.createHash('sha256').update(data).digest()
}

module.exports = function (impl, cb) {
  // testSync(impl)
  test('has gen methods', function (t) {
    t.doesNotThrow(function () {
      typeforce(types.keyCl, impl)
    })

    t.end()
  })

  testAsync(impl, cb)
}

// function testSync (impl) {
//   runTests(extend(impl), 'sync')
// }

function testAsync (impl, cb) {
  runTests(impl, 'async', cb)
}

function runTests (impl, name, cb) {
  // if (name === 'sync') {
  //   ;['gen'].forEach(method => {
  //     async[method] = utils.asyncify(impl[method + 'Sync'].bind(impl))
  //   })
  // }

  test(`gen (${name})`, function (t) {
    impl.gen(function (err, key) {
      if (err) throw err

      // if (name === 'sync') {
      //   ;['sign', 'verify'].forEach(method => {
      //     impl[method] = utils.asyncify(impl[method + 'Sync'].bind(impl))
      //   })
      // }

      t.doesNotThrow(function () {
        typeforce(types.key, key)
      })

      t.end()
    })
  })

  test(`sign (${name})`, function (t) {
    impl.gen(function (err, key) {
      if (err) throw err

      const data = 'blah'
      const hash = sha256(data)
      key.sign(hash, function (err, sig) {
        if (err) throw err

        key.verify(hash, sig, function (err, verified) {
          if (err) throw err

          t.ok(verified)
          t.end()
        })
      })
    })
  })

  test('done', function (t) {
    t.end()
    if (cb) cb()
  })
}

function asyncifyMethods (obj, methods) {
  methods.forEach(method => {
    async[method] = utils.asyncify(impl[method + 'Sync'].bind(impl))
  })
}
