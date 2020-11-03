import * as Bytes from '../bytes/bytes'
import * as C from 'io-ts/Codec'

// > The sender secretbox is a crypto_secretbox containing the sender's
// > long-term public key, encrypted with the payload key from below.
export type Value = Bytes.Value
export type Encoded = Bytes.Encoded

export const decoder = Bytes.decoder
export const encoder = Bytes.encoder

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
