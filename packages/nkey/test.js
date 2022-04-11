
const crypto = require('crypto')
const test = require('tape')
const types = require('./types')
const sha256 = function (data) {
  return crypto.createHash('sha256').update(data).digest()
}

module.exports = function (impl, cb) {
  test('has gen methods', function (t) {
    t.doesNotThrow(function () {
      typeforce(types.keyCl, impl)
    })

    t.end()
  })

  testAsync(impl, cb)
}

function testAsync (impl, cb) {
  runTests(impl, 'async', cb)
}

function runTests (impl, name, cb) {
  test(`gen (${name})`, function (t) {
    impl.gen({}, function (err, key) {
      if (err) throw err

      t.equal(key.isPrivateKey, true)

      t.doesNotThrow(function () {
        typeforce(types.key, key)
      })

      const exported = key.toJSON()
      t.doesNotThrow(function () {
        typeforce(types.pub, exported)
      })

      t.same(impl.fromJSON(exported).toJSON(), exported)
      t.end()
    })
  })

  test(`sign (${name})`, function (t) {
    impl.gen({}, function (err, key) {
      if (err) throw err

      const data = 'blah'
      const hash = sha256(data)
      key.sign(hash, function (err, sig) {
        if (err) throw err

        key = impl.fromJSON(key.toJSON())
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
