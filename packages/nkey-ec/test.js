const test = require('tape')
const impl = require('./')
const testImpl = require('nkey/test')
testImpl(impl, function () {
  impl.DEFAULT_CURVE = 'secp256k1'
  testImpl(impl, function () {
    impl.DEFAULT_CURVE = 'curve25519'
    // currently fails because nkey expects sign/verify
    // and curve25519 is for diffie hellman
    // test again when nkey is smarter
    testImpl(impl)
  })
})
