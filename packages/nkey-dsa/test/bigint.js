var test = require('tape')
  , BigInt = require('../vendor/bigint.js')

test('BigInt', function(t) {

  t.test('should exponentiate a BigInt with base two', function (t) {
    t.equal((Math.pow(2, 513)).toString(16), BigInt.bigInt2str(BigInt.twoToThe(513), 16))
    t.end()
  })

  t.test('should return a bit string of the proper length', function (t) {
    // 2^(8*3) < 2^(15*2) < 2^(8*4) === 4 bytes
    // chosen because each array element in bigint.js holds 15 bits
    // (on my machine) so it looks like [0, 0, 1]
    var test = BigInt.str2bigInt((Math.pow(2, 30)).toString(), 10)
    t.equal(4, BigInt.bigInt2bits(test).length)
    t.end()
  })

  t.test('should handle shift distances greater than the bit length of x', function (t) {
    var bi = BigInt.str2bigInt("10000000000", 2)
    BigInt.rightShift_(bi, 12)
    t.ok(BigInt.equalsInt(bi, 0))
    bi = BigInt.str2bigInt("10", 2)
    BigInt.rightShift_(bi, 26*3)
    t.ok(BigInt.equalsInt(bi, 0))
    t.end()
  })

})