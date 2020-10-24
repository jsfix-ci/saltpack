import * as BoxKeyPair from '../ed25519/box_keypair'
import * as PublicKey from '../ed25519/public_key'
import * as NaCl from 'tweetnacl'

export class Packet {
 private payloadKeyPair: BoxKeyPair.Value
 private ephemeralKeyPair: BoxKeyPair.Value
 private encryptedSenderPublicKey: Bytes.Value

 private senderSecretBox: SenderSecretBox.Value
 private recipientsList: RecipientsList.Value

 // When composing a message, the sender follows these steps to generate the header:
 constructor(
  mode: Mode.Value,
  senderPublicKey: PublicKey.Value,
  recipientPublicKeys: Array<RecipientPublicKey.Value>,
  visibleRecipients: boolean
 ) {
  // 1. Generate a random 32-byte payload key.
  this.payloadKeyPair = BoxKeyPair.generate()

  // 2. Generate a random ephemeral keypair, using crypto_box_keypair.
  this.ephemeralKeyPair = BoxKeyPair.generate()

  // 3. Encrypt the sender's long-term public key using crypto_secretbox with
  //    the payload key and the nonce saltpack_sender_key_sbox, to create the
  //    sender secretbox.
  this.senderSecretBox = NaCl.secretbox(senderPublicKey, SenderKeyNonce.NONCE, this.payloadKeyPair.secretKey)

  // 4. For each recipient, encrypt the payload key using crypto_box with the
  //    recipient's public key, the ephemeral private key, and the nonce
  //    saltpack_recipsbXXXXXXXX. XXXXXXXX is 8-byte big-endian unsigned
  //    recipient index, where the first recipient is index zero. Pair these
  //    with the recipients' public keys, or null for anonymous recipients, and
  //    collect the pairs into the recipients list.
  this.recipientsList: RecipientsList.Value = recipientPublicKeys.map((recipientPublicKey:RecipientPublicKey.Value, index:number) =>
   [
    ( visibleRecipients ? recipientPublicKey : null ),
    NaCl.box(
     this.payloadKeyPair.secretKey,
     RecipientPublicKey.nonce(recipient_public_key, index),
     recipientPublicKey,
     this.ephemeralKeyPair.secretKey,
    ),
   ]
  )

  // 5. Collect the format name, version, and mode into a list, followed by the
  //    ephemeral public key, the sender secretbox, and the nested recipients
  //    list.
  let theList = [
   FormatName.SaltPack,
   Version.Two,
   mode,
   this.ephemeralKeyPair.publicKey,
   this.senderSecretBox,
   this.recipientsList,
  ]

  // 6. Serialize the list from #5 into a MessagePack array object.
  let theListPacked: MP.Value = MP.Codec.encode(PacketList.Codec.encode(theList))

  // 7. Take the crypto_hash (SHA512) of the bytes from #6. This is the header
  //    hash.
  let headerHash = NaCl.hash(theListPacked)

  // 8. Serialize the bytes from #6 again into a MessagePack bin object. These
  //    twice-encoded bytes are the header packet.
  //
  //    After generating the header, the sender computes each recipient's MAC
  //    key, which will be used below to authenticate the payload:
  let headerPacket: MP.Value = MP.Codec.encode(theListPacked)

  // 9. Concatenate the first 16 bytes of the header hash from step 7 above,
  //    with the recipient index from step 4 above. This is the basis of each
  //    recipient's MAC nonce.
  //
  // 10. Clear the least significant bit of byte 15. That is: nonce[15] &= 0xfe.
  // 11. Encrypt 32 zero bytes using crypto_box with the recipient's public key,
  //     the sender's long-term private key, and the nonce from the previous
  //     step.
  // 12. Modify the nonce from step 10 by setting the least significant bit of
  //     byte
  //      1. That is: nonce[15] |= 0x01.
  // 13. Encrypt 32 zero bytes again, as in step 11, but using the ephemeral
  //     private key rather than the sender's long term private key.
  // 14. Concatenate the last 32 bytes each box from steps 11 and 13. Take the
  //     SHA512 hash of that concatenation. The recipient's MAC Key is the first
  //     32 bytes of that hash.
 }
}
