export const NONCE_PREFIX = [
 115, 97, 108, 116, 112, 97, 99, 107, 95, 112, 108, 111, 97, 100, 115, 98
]

// > The payload secretbox is a NaCl secretbox containing a chunk of the
// > plaintext bytes, max size 1 MB. It's encrypted with the payload key. The
// > nonce is saltpack_ploadsbNNNNNNNN where NNNNNNNN is the packet number as an
// > 8-byte big-endian unsigned integer. The first payload packet is number 0.
export const generate(
 index:number,
 chunk:Chunk,
 payloadKeyPair:BoxKeyPair.Value,
):Uint8Array =>
 NaCl.secretbox(
  chunk,
  Nonce.indexed(NONCE_PREFIX, index),
  payloadKeyPair.secretKey,
 )
