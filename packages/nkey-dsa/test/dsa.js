var test = require('tape')
  , fs = require('fs')
  , path = require('path')
  , HLP = require('../lib/helpers.js')
  , DSA = require('../lib/dsa.js')
  , BigInt = require('../vendor/bigint.js')
  , prekeys = require('./data/keys.js')

test('DSA', function(t) {

  var key, L, N

  // time the keygen but require before
  process.stdout.write('# generating the key ... ')
  var start = (new Date()).getTime()
  L = 1024
  N = 160
  key = new DSA(null, { bit_length: L })
  console.log('(' + ((new Date()).getTime() - start) + 'ms)')

  t.test('should generate a key with q > 2^(N - 1) and q < 2^N', function (t) {
    t.ok(HLP.between(key.q, BigInt.twoToThe(N - 1), BigInt.twoToThe(N)), 'q in between.')
    t.end()
  })

  t.test('should generate a key with p > 2^(L - 1) and p < 2^L', function (t) {
    t.ok(HLP.between(key.p, BigInt.twoToThe(L - 1), BigInt.twoToThe(L)), 'p in between.')
    t.end()
  })

  t.test('should generate a key with q being a multiple of q', function (t) {
    var quotient = BigInt.str2bigInt('0', 10, BigInt.bitSize(key.p))
      , remainder = BigInt.str2bigInt('0', 10, BigInt.bitSize(key.p))
    var p_minus = BigInt.sub(key.p, BigInt.str2bigInt('1', 10))
    BigInt.divide_(p_minus, key.q, quotient, remainder)
    t.ok(BigInt.isZero(remainder), 'Multiple.')
    t.end()
  })

  t.test('should verify a valid signature', function (t) {
    var s = key.sign('abc')
    t.equal(1, DSA.verify(key, 'abc', s[0], s[1]), 'Verify signed message.')
    t.end()
  })

  t.test('should parse a given public key into the correct parameters', function (t) {
    var par = DSA.parsePublic(key.packPublic())
    t.ok(BigInt.equals(key.p, par.p), 'Pees are good.')
    t.ok(BigInt.equals(key.q, par.q), 'Qs.')
    t.ok(BigInt.equals(key.g, par.g), 'Gs.')
    t.ok(BigInt.equals(key.y, par.y), 'Ys.')
    t.end()
  })

  t.test('should return a fingerprint for the public key', function (t) {
    var finger = key.fingerprint()
    t.equal(40, finger.length, 'SHA1 Hex')
    t.end()
  })

  t.test('should parse a given private key into the correct params', function (t) {
    var par = DSA.parsePrivate(key.packPrivate())
    t.ok(BigInt.equals(key.p, par.p), 'Pees are good.')
    t.ok(BigInt.equals(key.q, par.q), 'Qs.')
    t.ok(BigInt.equals(key.g, par.g), 'Gs.')
    t.ok(BigInt.equals(key.y, par.y), 'Ys.')
    t.ok(BigInt.equals(key.x, par.x), 'Xs.')
    t.end()
  })

  t.test('should parse a private key from the standard libotr format', function (t) {
    var str = "(privkeys \
      (account \
        (name \"foo@example.com\") \
        (protocol prpl-jabber) \
        (private-key \
          (dsa \
            (q #AA6B0EFC9135D7DBBC44254C63DA1A941E818BD1#) \
            (p #C183E9B1029099FE5BECD19610178B943CC62A49D45B1F19BC62E8783334C4A384DD3EE13553CC27118E32786BBD1D82EAED9AA3238C9BC9769703A6000FFD2A415817D97C919FF9BDD13AA82DC16D598881785178BD3D5087F6FAAE1D9415427B85A3CA0EB46E5C8FFA786A8841592644A332E915A5301D624CA80FE54DE0D9#) \
            (g #3B7158464B65769BB847C8107A4CAFA722400DCB300810C02795F7CB1728C9846A8A2B97156C0D22C9B81AA71348ECD27EC42E2BCABF131B4273D24CDD2E81E0DD0F01F1A567448C775094772CEBD8BEE3DF783A20F5E788E660F771EB26A70E615C204B1FFB70DB0FC6BA459D2AB0CDBCB64A93D41F7268A5F767BB851E5BB0#) \
            (x #A992943DEA115032153A4B1687152D4CC64100E1#) \
            (y #A92BCA0D2489AEEE94441B6858884A79E7FB1F2E2F699753A76EDDD08C4C94A40D569A426DE23EA2DE11FF73D094879D6D13191C21FEBF6C65ACE518C271EC9D258672CC46EA0BFE354E8B8AD6F6BC6F1E736CE53B1C47F7F5D9EBD9937A7F9D4FE1041B2C235C3B36233187C0FA0A88DFA3970DC1AC70BF3A3989B622F2F454#) \
          ) \
        ) \
      ) \
    )"

    var par = DSA.parsePrivate(str, true)
    t.ok(BigInt.equals(prekeys.userA.p, par.p), 'Pees are good.')
    t.ok(BigInt.equals(prekeys.userA.q, par.q), 'Qs.')
    t.ok(BigInt.equals(prekeys.userA.g, par.g), 'Gs.')
    t.ok(BigInt.equals(prekeys.userA.y, par.y), 'Ys.')
    t.ok(BigInt.equals(prekeys.userA.x, par.x), 'Xs.')
    t.end()
  })

  var pidginFile = path.join(process.env.HOME, ".purple/otr.private_key")
  t.test('should parse my private key from pidgin', { skip: (!fs.existsSync(pidginFile)) && 'no pidgin key found in user HOME' }, function (t) {
    var string = fs.readFileSync(pidginFile, 'utf8')
    var par = DSA.parsePrivate(string, true)

    t.ok(par.p)
    t.ok(par.q)
    t.ok(par.g)
    t.ok(par.y)
    t.ok(par.x)
    t.end()
  })
})