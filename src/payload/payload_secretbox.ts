import * as Chunk from './chunk'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as NaCl from 'tweetnacl'
import * as Nonce from '../nonce/nonce'
import * as Bytes from '../bytes/bytes'
import * as C from 'io-ts/Codec'

export type Value = Uint8Array
export type Encoded = Uint8Array

export const decoder = Bytes.decoder
export const encoder = Bytes.encoder

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)

export const NONCE_PREFIX = Uint8Array.from([
 115, 97, 108, 116, 112, 97, 99, 107, 95, 112, 108, 111, 97, 100, 115, 98
])

// > The payload secretbox is a NaCl secretbox containing a chunk of the
// > plaintext bytes, max size 1 MB. It's encrypted with the payload key. The
// > nonce is saltpack_ploadsbNNNNNNNN where NNNNNNNN is the packet number as an
// > 8-byte big-endian unsigned integer. The first payload packet is number 0.
export const generate = (
 index:number,
 chunk:Chunk.Value,
 payloadKeyPair:BoxKeyPair.Value,
):Value =>
 NaCl.secretbox(
  chunk,
  Nonce.indexed(NONCE_PREFIX, index),
  payloadKeyPair.secretKey,
 )
