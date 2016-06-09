
const typeforce = require('typeforce')

exports.keyCl = typeforce.compile({
  fromJSON: typeforce.Function,
  gen: typeforce.Function,
  genSync: typeforce.maybe(typeforce.Function)
})

exports.key = typeforce.compile({
  type: typeforce.String,
  pubKeyString: typeforce.String,
  // async
  sign: typeforce.Function,
  verify: typeforce.Function,
  // sync
  signSync: typeforce.maybe(typeforce.Function),
  verifySync: typeforce.maybe(typeforce.Function),
})

exports.pub = typeforce.compile({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.Null,
  fingerprint: typeforce.String,
})

exports.priv = typeforce.compile({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.String,
  fingerprint: typeforce.String
})
