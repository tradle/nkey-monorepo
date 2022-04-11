
const typeforce = require('@tradle/typeforce')

exports.keyCl = typeforce.object({
  fromJSON: typeforce.Function,
  gen: typeforce.Function,
  genSync: typeforce.maybe(typeforce.Function)
})

exports.key = typeforce.object({
  type: typeforce.String,
  pubKeyString: typeforce.String,
  // async
  sign: typeforce.Function,
  verify: typeforce.Function,
  // sync
  signSync: typeforce.maybe(typeforce.Function),
  verifySync: typeforce.maybe(typeforce.Function),
})

exports.pub = typeforce.object({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.Null,
  fingerprint: typeforce.String,
})

exports.priv = typeforce.object({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.String,
  fingerprint: typeforce.String
})
