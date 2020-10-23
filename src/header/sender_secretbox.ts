import * as Sized from '../bytes/sized'
import * as C from 'io-ts/Codec'

// > The sender secretbox is a crypto_secretbox containing the sender's
// > long-term public key, encrypted with the payload key from below.
export type Value = Sized.Value
export type Encoded = Sized.Encoded

// @todo not sure about this
const length = 32

export const decoder = Sized.decoderBuilder(length)
export const encoder = Sized.encoder

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)
