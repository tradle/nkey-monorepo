
const crypto = require('crypto')
const test = require('tape')
const types = require('./types')
const sha256 = function (data) {
  return crypto.createHash('sha256').update(data).digest()
}

module.exports = function nkeyTestSuite (impl, opts, cb) {
  if (typeof opts === 'function') {
    return nkeyTestSuite(impl, null, opts)
  }
  const subTest = (opts && opts.t) ? function (name, o, cb) { opts.t.test(name, o, cb) } : test
  const group = `[${impl.type}${opts && opts.variant ? ` / ${opts.variant}` : ''}]`

  subTest(`${group} API`, function (t) {
    t.doesNotThrow(() => types.keyCl.assert(impl), 'API implementation check')
    t.end()
  })

  subTest(`${group} gen (sync)`, function (t) {
    const key = impl.genSync({})
    types.key.assert(key)
    if (key.isSignKey) {
      t.doesNotThrow(() => types.signKey.assert(key), 'the generated key needs to return a sign key')
    }
    t.equal(key.isPrivateKey, true, 'the generated keys need to be private keys')
    t.equal(key.type, impl.type, 'key.type needs to equal impl.type')
    t.end()
  })

  subTest(`${group} to/fromJSON (sync)`, function (t) {
    const key = impl.genSync({})
    const pubKeyJSON = key.toJSON()
    t.doesNotThrow(() => types.pub.assert(pubKeyJSON), 'standard .toJSON() creates a  public key')
    const privKeyJSON = key.toJSON(true)
    t.equals(privKeyJSON.type, impl.type)
    t.doesNotThrow(() => types.priv.assert(privKeyJSON), '.toJSON(true) returns the full private key')
    t.same(impl.fromJSON(privKeyJSON).toJSON(true), privKeyJSON, '.fromJSON(.toJSON(true)) should return an equal key')
    t.end()
  })

  subTest(`${group} sign (sync)`, function (t) {
    const privKey = impl.genSync({})
    if (!privKey.isSignKey) {
      t.skip(`${group} doesn't generate a signing key`)
      return t.end()
    }
    const data = 'blah'
    const hashBuffer = sha256(data)
    const sig = privKey.signSync(hashBuffer)
    t.equal(typeof sig, 'string', 'the signature is a string')
    const pubKey  = impl.fromJSON(privKey.toJSON())
    t.ok(pubKey.verifySync(hashBuffer, sig), 'signing can be verified by pubKey')
    t.ok(privKey.verifySync(hashBuffer, sig), 'signing can be verified by privKey')
    t.end()
  })

  subTest(`${group} set/get extra properties`, function (t) {
    const privKey = impl.genSync({})
    privKey.set('someProp', 'abcd')
    t.same(privKey.get('someProp'), 'abcd', 'can read the extra properties')
    t.same(privKey.toJSON().someProp, 'abcd', 'extra properties are added to the JSON output')
    const imported = impl.fromJSON(privKey.toJSON())
    t.same(imported.get('someProp'), 'abcd', 'can read the extra property after import')
    t.end()
  })

  subTest(`${group} async APIS`, function (t) {
    impl.gen({}, (err, privKey) => {
      t.error(err, 'successful gen')
      if (privKey.isSignKey) {
        const data = sha256(Buffer.from('abcd'))
        privKey.sign(data, (err, signature) => {
          t.error(err, 'successful sign')
          privKey.verify(data, signature, (err, verified) => {
            t.error(err, 'successful verify')
            t.ok(verified, 'is verified')
            t.end()
          })
        })
      } else {
        t.end()
      }
    })
  })

  if (cb) {
    subTest(`${group} done`, function (t) {
      t.end()
      cb()
    })
  }
}
