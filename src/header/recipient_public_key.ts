import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'
import * as PublicKey from '../ed25519/public_key'

// > The recipient public key is the recipient's long-term NaCl public
// > encryption key. This field may be null, when the recipients are anonymous.
export type Value = PublicKey.Value
export type Values = Array<Value>
export type Encoded = PublicKey.Encoded

export const decoder = PublicKey.decoder
export const encoder = PublicKey.encoder

export const Codec = PublicKey.Codec

// 'saltpack_recipsb' as utf8 bytes
export const NONCE_PREFIX = Uint8Array.from([
 115, 97, 108, 116, 112, 97, 99, 107, 95, 114, 101, 99, 105, 112, 115, 98
])
