import * as Bytes from '../bytes/bytes'

// > The payload key box is a crypto_box containing a copy of the payload key,
// > encrypted with the recipient's public key, the ephemeral private key, and
// > a counter nonce.
export type Value = Bytes.Value
export type Encoded = Bytes.Encoded

export const decoder = Bytes.decoder
export const encoder = Bytes.encoder

export const Codec = Bytes.Codec
