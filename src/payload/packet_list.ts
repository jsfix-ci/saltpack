import * as FinalFlag from './final_flag'
import * as AuthenticatorsList from './authenticators_list'
import * as PayloadSecretBox from './payload_secretbox'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

export type Value = [
 FinalFlag.Value,
 AuthenticatorsList.Value,
 PayloadSecretBox.Value,
]

export type Encoded = [
 FinalFlag.Encoded,
 AuthenticatorsList.Encoded,
 PayloadSecretBox.Encoded,
]

export const decoder: D.Decoder<unknown, Value> = D.tuple(
 FinalFlag.decoder,
 AuthenticatorsList.decoder,
 PayloadSecretBox.decoder,
)

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) =>
  [
   FinalFlag.Codec.encode(v[0]),
   AuthenticatorsList.Codec.encode(v[1]),
   PayloadSecretBox.Codec.encode(v[2]),
  ]
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
