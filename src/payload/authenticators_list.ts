import * as Crypto from 'crypto'

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
export type Value = Array<MacTag>

// We compute the authenticators in three steps:
export const calculate = (
 index:number,
 headerHash:sha512,
 final_flag:FinalFlag.Value,
 payloadSecretBox:Uint8Array,
 recpientMacKey:Mac.Value,
) => {
 // 1. Concatenate the header hash, the nonce for the payload secretbox, the
 //    final flag byte (0x00 or 0x01), and the payload secretbox itself.
 let bytes = UintArray.from([
  ...headerHash,
  ...Nonce.indexed(PayloadSecretBox.NONCE_PREFIX, index),
  ...final_flag,
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
}
