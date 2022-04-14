const impl = require('./')
const testSuite = require('nkey-testsuite')
const tape = require('tape')

const curves = [
  'secp256k1',
  'p192',
  'p256',
  'p384',
  'p521'
]
const initialCurve = impl.DEFAULT_CURVE
for (const curve of curves) {
  tape(`curve = ${curve}`, t => {
    impl.DEFAULT_CURVE = curve
    testSuite(impl, { t, variant: curve }, function () {
      impl.DEFAULT_CURVE = initialCurve
      t.end()
    })
  })
}

