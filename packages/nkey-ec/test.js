const test = require('tape')
const impl = require('./')
require('nkey/test')(impl, function () {
  impl.DEFAULT_CURVE = 'secp256k1'
  require('nkey/test')(impl)
})
