"use strict";

var HLP
module.exports = HLP = {}
var BigInt = require('../vendor/bigint.js')

// data types (byte lengths)
var DTS = {
    BYTE  : 1
  , SHORT : 2
  , INT   : 4
  , CTR   : 8
  , MAC   : 20
  , SIG   : 40
}

HLP.between = function (x, a, b) {
  return (BigInt.greater(x, a) && BigInt.greater(b, x))
}

var _toString = String.fromCharCode;
HLP.packBytes = function (val, bytes) {
  val = val.toString(16)
  var nex, res = ''  // big-endian, unsigned long
  for (; bytes > 0; bytes--) {
    nex = val.length ? val.substr(-2, 2) : '0'
    val = val.substr(0, val.length - 2)
    res = _toString(parseInt(nex, 16)) + res
  }
  return res
}

HLP.packINT = function (d) {
  return HLP.packBytes(d, DTS.INT)
}

HLP.unpack = function (arr) {
  var val = 0, i = 0, len = arr.length
  for (; i < len; i++) {
    val = (val * 256) + arr[i]
  }
  return val
}

HLP.packData = function (d) {
  return HLP.packINT(d.length) + d
}

HLP.bits2bigInt = function (bits) {
  bits = HLP.toByteArray(bits)
  return BigInt.ba2bigInt(bits)
}

HLP.packMPI = function (mpi) {
  return HLP.packData(BigInt.bigInt2bits(BigInt.trim(mpi, 0)))
}

HLP.readLen = function (msg) {
  msg = HLP.toByteArray(msg.substring(0, 4))
  return HLP.unpack(msg)
}

HLP.readData = function (data) {
  var n = HLP.unpack(data.splice(0, 4))
  return [n, data]
}

HLP.readMPI = function (data) {
  data = HLP.toByteArray(data)
  data = HLP.readData(data)
  return BigInt.ba2bigInt(data[1])
}

HLP.splitype = function splitype(arr, msg) {
  var data = []
  arr.forEach(function (a) {
    var str
    switch (a) {
      case 'PUBKEY':
        str = splitype(['SHORT', 'MPI', 'MPI', 'MPI', 'MPI'], msg).join('')
        break
      case 'DATA':  // falls through
      case 'MPI':
        str = msg.substring(0, HLP.readLen(msg) + 4)
        break
      default:
        str = msg.substring(0, DTS[a])
    }
    data.push(str)
    msg = msg.substring(str.length)
  })
  return data
}

// https://github.com/msgpack/msgpack-javascript/blob/master/msgpack.js

var _bin2num = (function () {
  var i = 0, _bin2num = {}
  for (; i < 0x100; ++i) {
    _bin2num[String.fromCharCode(i)] = i  // "\00" -> 0x00
  }
  for (i = 0x80; i < 0x100; ++i) {  // [Webkit][Gecko]
    _bin2num[String.fromCharCode(0xf700 + i)] = i  // "\f780" -> 0x80
  }
  return _bin2num
}())

HLP.toByteArray = function (data) {
  var rv = []
    , ary = data.split("")
    , i = -1
    , iz = ary.length
    , remain = iz % 8

  while (remain--) {
    ++i
    rv[i] = _bin2num[ary[i]]
  }
  remain = iz >> 3
  while (remain--) {
    rv.push(_bin2num[ary[++i]], _bin2num[ary[++i]],
            _bin2num[ary[++i]], _bin2num[ary[++i]],
            _bin2num[ary[++i]], _bin2num[ary[++i]],
            _bin2num[ary[++i]], _bin2num[ary[++i]])
  }
  return rv
}
