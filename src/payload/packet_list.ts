export type Value = [
 FinalFlag.Value,
 Authenticators.Value,
 PayloadSecretBox.Value,
]

export type Encoded = [
 FinalFlag.Encoded,
 Authenticators.Encoded,
 PayloadSecretBox.Encoded,
]

export const decoder: D.Decoder<unknown, Value> = D.tuple(
 FinalFlag.decoder,
 Authenticators.decoder,
 PayloadSecretBox.decoder,
)

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) =>
  [
   FinalFlag.Codec.encode(v[0]),
   Authenticators.Codec.encode(v[1]),
   PayloadSecretBox.Codec.encode(v[2]),
  ]
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
