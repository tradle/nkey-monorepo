var test = require('tape')
  , BigInt = require('../vendor/bigint.js')
  , HLP = require('../lib/helpers.js')

test('Helpers', function (t) {

  var two55, str

  t.test('should pack empty data correctly', function (t) {
    t.equal('\x00\x00\x00\x00', HLP.packData(''), 'Empty pack.')
    t.end()
  })
  
  t.test('should pack mpi data correctly', function (t) {
    var test = HLP.packMPI(BigInt.str2bigInt('65280', 10))
    t.equal('\x00\x00\x00\x02\xff\x00', test, 'They be equal.')

    var test3 = HLP.packMPI(BigInt.str2bigInt('0', 10))
    t.equal('\x00\x00\x00\x00', test3, 'Zero')

    two55 = '32317006071311007300714876688669951960444102669715484032130345427524655138867890893197201411522913463688717960921898019494119559150490921095088152386448283120630877367300996091750197750389652106796057638384067568276792218642619756161838094338476170470581645852036305042887575891541065808607552399123930385521914333389668342420684974786564569494856176035326322058077805659331026192708460314150258592864177116725943603718461857357598351152301645904403697613233287231227125684710820209725157101726931323469678542580656697935045997268352998638215525166389437335543602135433229604645318478604952148193555853611059596230656'
    str = '\x00\x00\x01\x01\x01'
    for (var i = 0; i < 256; i++) str += '\x00'
    t.equal(str, HLP.packMPI(BigInt.str2bigInt(two55, 10)), 'BigInt')
    t.end()
  })

  t.test('should read mpi data correctly', function (t) {
    t.equal('65280', BigInt.bigInt2str(HLP.readMPI('\x00\x00\x00\x02\xff\x00'), 10), 'Read MPI.')
    t.equal(two55, BigInt.bigInt2str(HLP.readMPI(str), 10))
    t.end()
  })

})