import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import * as FormatName from './format_name'
import * as Version from './version'
import * as Mode from './mode'
import * as PublicKey from '../ed25519/public_key'
import * as SenderSecretBox from './sender_secretbox'
import * as RecipientsList from './recipients_list'

export type Value = [
 FormatName.Value,
 Version.Value,
 Mode.Value,
 PublicKey.Value,
 SenderSecretBox.Value,
 RecipientsList.Value,
]

export type Encoded = [
 FormatName.Encoded,
 Version.Encoded,
 Mode.Encoded,
 PublicKey.Encoded,
 SenderSecretBox.Encoded,
 RecipientsList.Encoded,
]

export const decoder: D.Decoder<unknown, Value> = D.tuple(
 FormatName.decoder,
 Version.decoder,
 Mode.decoder,
 PublicKey.decoder,
 SenderSecretBox.decoder,
 RecipientsList.decoder,
)

export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) =>
  [
   FormatName.Codec.encode(v[0]),
   Version.Codec.encode(v[1]),
   Mode.Codec.encode(v[2]),
   PublicKey.Codec.encode(v[3]),
   SenderSecretBox.Codec.encode(v[4]),
   RecipientsList.Codec.encode(v[5]),
  ]
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
