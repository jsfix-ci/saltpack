import * as Crypto from 'crypto'
import * as MacTag from './mac_tag'
import * as Sha512 from '../ed25519/sha512'
import * as FinalFlag from './final_flag'
import * as Mac from '../header/mac'
import * as Nonce from '../nonce/nonce'
import * as PayloadSecretBox from './payload_secretbox'
import * as NaCl from 'tweetnacl'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import * as C from 'io-ts/Codec'

// > The authenticators list contains 32-byte HMAC tags, one for each recipient,
// > which authenticate the payload secretbox together with the message header.
// > These are computed with the MAC keys derived from the header. See below.
//
// > Computing the MAC keys is the only step of encrypting a message that
// > requires the sender's private key. Thus it's the authenticators list,
// > generated from those keys, that proves the sender is authentic. We also
// > include the hash of the entire header as an input to the authenticators, to
// > prevent an attacker from modifying the format version or any other header
// > fields.
export type Value = Array<MacTag.Value>

export type Encoded = Array<MacTag.Encoded>

export const decoder: D.Decoder<unknown, Value> = D.array(MacTag.decoder)
export const encoder: E.Encoder<Encoded, Value> = {
 encode: (v: Value) => v.map(MacTag.Codec.encode)
}

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)

// We compute the authenticators in three steps:
export const calculate = (
 headerHash:Sha512.Value,
 finalFlag:FinalFlag.Value,
 payloadSecretBox:PayloadSecretBox.Value,
 index:number,
 recipientMacKey:Mac.Value,
):MacTag.Value => {
 // 1. Concatenate the header hash, the nonce for the payload secretbox, the
 //    final flag byte (0x00 or 0x01), and the payload secretbox itself.
 let bytes = Uint8Array.from([
  ...headerHash,
  ...Nonce.indexed(PayloadSecretBox.NONCE_PREFIX, index),
  ...Uint8Array.from([finalFlag]),
  ...payloadSecretBox,
 ])

 // 2. Compute the crypto_hash (SHA512) of the bytes from #1.
 let hash = NaCl.hash(bytes)

 // 3. For each recipient, compute the crypto_auth (HMAC-SHA512, truncated to 32
 //    bytes) of the hash from #2, using that recipient's MAC key.
 let hmac = Crypto
  .createHmac('sha512', recipientMacKey)
  .update(hash)
  .digest()

  return hmac.slice(0, 32)
}
