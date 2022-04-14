const typeforce = require('@tradle/typeforce')

exports.key = typeforce.object({
  type: typeforce.String,
  pubKeyString: typeforce.String,
  isPrivateKey: typeforce.Boolean,
  fingerprint: typeforce.String,
  hasDeterministicSig: typeforce.Boolean,
  set: typeforce.Function,
  get: typeforce.Function
})

exports.keyCl = typeforce.object({
  type: typeforce.String,
  fromJSON: typeforce.Function,
  gen: typeforce.Function,
  genSync: typeforce.Function
})

exports.signKey = typeforce.allOf(
  exports.key,
  typeforce.compile({
    isSignKey: typeforce.value(true),
    // async
    sign: typeforce.Function,
    verify: typeforce.Function,
    // sync
    signSync: typeforce.Function,
    verifySync: typeforce.Function
  })
)

// JSON!
exports.pub = typeforce.object({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.Null,
  fingerprint: typeforce.String
})

// JSON!
exports.priv = typeforce.object({
  type: typeforce.String,
  pub: typeforce.String,
  priv: typeforce.String,
  fingerprint: typeforce.String
})
