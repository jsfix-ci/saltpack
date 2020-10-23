import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import * as PublicKey from '../ed25519/public_key'

// > The recipient public key is the recipient's long-term NaCl public
// > encryption key. This field may be null, when the recipients are anonymous.
export type Value = PublicKey.Value
export type Encoded = PublicKey.Encoded

export const decoder = PublicKey.decoder
export const encoder = PublicKey.encoder

export const Codec = PublicKey.Codec
