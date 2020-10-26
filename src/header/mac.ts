import * as RecipientPublicKey from './recipient_public_key'
import * as Sized from '../bytes/sized'
import * as Bytes from '../bytes/bytes'
import * as C from 'io-ts/lib/Codec'
import * as Sha512 from '../ed25519/sha512'
import * as NaCl from 'tweetnacl'
import * as SecretKey from '../ed25519/secret_key'
import * as PublicKey from '../ed25519/public_key'

export type NonceBasis = Uint8Array

export const length = 32

export type Value = Sized.Value
export type Values = Array<Value>
export type Encoded = Sized.Encoded

export const decoder: typeof Bytes.decoder = Sized.decoderBuilder(length)
export const encoder = Sized.encoder

export const Codec: C.Codec<unknown, Encoded, Value> = C.make(decoder, encoder)

export const calculate = (
 headerHash: Sha512.Value,
 index: number,
 // Sender: sender long term secret key OR ephemeral secret key if anon sender
 // Receiver: receiver's secret key
 longTermSecretKey: SecretKey.Value,
 // Sender: receiver's public key
 // Receiver: sender's public key, extracted from senderSecretBox in header list
 longTermPublicKey: PublicKey.Value,
 // Sender: generated ephemeral secret key
 // Receiver: receiver's secret key
 ephemeralSecretKey: SecretKey.Value,
 // Sender: receiver's public key
 // Receiver: ephemeral public key extracted from the header
 ephemeralPublicKey: PublicKey.Value,
) => {
 // 9. Concatenate the first 16 bytes of the header hash from step 7 above,
 //    with the recipient index from step 4 above. This is the basis of each
 //    recipient's MAC nonce.
 let be = Buffer.allocUnsafe(4)
 be.writeUInt32BE(index)
 let macNonceBasis: NonceBasis = Uint8Array.from([
  ...Uint8Array.from(headerHash.slice(0,16)),
  // pragmatically we only deal with u32 integer indexes because messagepack
  // itself doesn't support more than u32 max recipients and javascript has
  // awkward or nonexistent u64 native handling.
  ...Uint8Array.from([0, 0, 0, 0]),
  ...Uint8Array.from(be),
 ])

 // 10. Clear the least significant bit of byte 15. That is: nonce[15] &= 0xfe.
 let longTermKeyMacNonce = macNonceBasis
 longTermKeyMacNonce[15] &= 0xfe

 // 11. Encrypt 32 zero bytes using crypto_box with the recipient's public
 //     key, the sender's long-term private key, and the nonce from the
 //     previous step.
 let longTermBox = NaCl.box(
  Uint8Array.from(Array(32)),
  longTermKeyMacNonce,
  longTermPublicKey,
  longTermSecretKey,
 )

 // 12. Modify the nonce from step 10 by setting the least significant bit of
 //     byte
 //      1. That is: nonce[15] |= 0x01.
 let ephemeralKeyMacNonce = macNonceBasis
 ephemeralKeyMacNonce[15] |= 0x01

 // 13. Encrypt 32 zero bytes again, as in step 11, but using the ephemeral
 //     private key rather than the sender's long term private key.
 let ephemeralBox = NaCl.box(
  Uint8Array.from(Array(32)),
  ephemeralKeyMacNonce,
  ephemeralPublicKey,
  ephemeralSecretKey,
 )

 // 14. Concatenate the last 32 bytes each box from steps 11 and 13. Take the
 //     SHA512 hash of that concatenation. The recipient's MAC Key is the
 //     first 32 bytes of that hash.
 let hash: Uint8Array = NaCl.hash(Uint8Array.from([
  ...Uint8Array.from(longTermBox.slice(-32)),
  ...Uint8Array.from(ephemeralBox.slice(-32)),
 ]))

 return hash.slice(0, 32)
}
