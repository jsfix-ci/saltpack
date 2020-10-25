import * as BoxKeyPair from '../ed25519/box_keypair'
import * as PublicKey from '../ed25519/public_key'
import * as NaCl from 'tweetnacl'
import * as Bytes from '../bytes/bytes'
import * as SenderSecretBox from './sender_secretbox'
import * as RecipientsList from './recipients_list'
import * as Mode from './mode'
import * as RecipientPublicKey from './recipient_public_key'
import * as SenderKeyNonce from './sender_key_nonce'
import * as FormatName from './format_name'
import * as Version from './version'
import * as MP from '../messagepack/messagepack'

type PacketList = [
 FormatName.Value,
 Version.Value,
 Mode.Value,
 PublicKey.Value,
 SenderSecretBox.Value,
 RecipientsList.Value,
]

export class Sender {
 private payloadKeyPair: BoxKeyPair.Value
 private ephemeralKeyPair: BoxKeyPair.Value

 private senderSecretBox: SenderSecretBox.Value
 private recipientsList: RecipientsList.Value = []

 private theList: PacketList
 private theListPacked: MP.Value

 // When composing a message, the sender follows these steps to generate the header:
 constructor(
  mode: Mode.Value,
  senderKeyPair: BoxKeyPair.Value,
  recipientPublicKeys: RecipientPublicKey.Values,
  visibleRecipients: boolean,
 ) {
  // 1. Generate a random 32-byte payload key.
  this.payloadKeyPair = BoxKeyPair.generate()

  // 2. Generate a random ephemeral keypair, using crypto_box_keypair.
  this.ephemeralKeyPair = BoxKeyPair.generate()

  // 3. Encrypt the sender's long-term public key using crypto_secretbox with
  //    the payload key and the nonce saltpack_sender_key_sbox, to create the
  //    sender secretbox.
  this.senderSecretBox = NaCl.secretbox(senderKeyPair.publicKey, SenderKeyNonce.NONCE, this.payloadKeyPair.secretKey)

  // 4. For each recipient, encrypt the payload key using crypto_box with the
  //    recipient's public key, the ephemeral private key, and the nonce
  //    saltpack_recipsbXXXXXXXX. XXXXXXXX is 8-byte big-endian unsigned
  //    recipient index, where the first recipient is index zero. Pair these
  //    with the recipients' public keys, or null for anonymous recipients, and
  //    collect the pairs into the recipients list.
  this.recipientsList = recipientPublicKeys.map((recipientPublicKey:RecipientPublicKey.Value, index:number) =>
   [
    ( visibleRecipients ? recipientPublicKey : null ),
    NaCl.box(
     this.payloadKeyPair.secretKey,
     RecipientPublicKey.nonce(index),
     recipientPublicKey,
     this.ephemeralKeyPair.secretKey,
    ),
   ]
  )

  // 5. Collect the format name, version, and mode into a list, followed by the
  //    ephemeral public key, the sender secretbox, and the nested recipients
  //    list.
  this.theList = [
   FormatName.Value.SaltPack,
   Version.Value.Two,
   mode,
   this.ephemeralKeyPair.publicKey,
   this.senderSecretBox,
   this.recipientsList,
  ]

  // 6. Serialize the list from #5 into a MessagePack array object.
  this.theListPacked = MP.Codec.encode(PacketList.Codec.encode(theList))

  // 7. Take the crypto_hash (SHA512) of the bytes from #6. This is the header
  //    hash.
  this.headerHash:Uint8Array = NaCl.hash(this.theListPacked)

  // 8. Serialize the bytes from #6 again into a MessagePack bin object. These
  //    twice-encoded bytes are the header packet.
  this.headerPacket: MP.Value = MP.Codec.encode(this.theListPacked)

  //    After generating the header, the sender computes each recipient's MAC
  //    key, which will be used below to authenticate the payload:
  this.macNonces = this.recipientsList.map(( [ recipientPublicKey, _ ], index) => {
   // 9. Concatenate the first 16 bytes of the header hash from step 7 above,
   //    with the recipient index from step 4 above. This is the basis of each
   //    recipient's MAC nonce.
   let be = Buffer.allocUnsafe(4)
   be.writeUInt32BE(index)
   let macNonceBasis: MacNonce.Value = Uint8Array.from([
    ...Uint8Array.from(this.headerHash.slice(0,16)),
    // pragmatically we only deal with u32 integer indexes because messagepack
    // itself doesn't support more than u32 max recipients and javascript has
    // awkward or nonexistent u64 native handling.
    ...Uint8Array.from([0, 0, 0, 0]),
    ...Uint8Array.from(be),
   ])

   // 10. Clear the least significant bit of byte 15. That is: nonce[15] &= 0xfe.
   let longTermKeyMacNonce = macNonceBasis
   longTermKeyMacNonce[15] &= 0xfe

   // 11. Encrypt 32 zero bytes using crypto_box with the recipient's public key,
   //     the sender's long-term private key, and the nonce from the previous
   //     step.
   let longTermBox = NaCl.box(
    Uint8Array.from(Array(32)),
    longTermKeyMacNonce,
    recipientPublicKey,
    senderKeyPair.privateKey,
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
    recipientPublicKey,
    this.ephemeralKeyPair.privateKey,
   )

   // 14. Concatenate the last 32 bytes each box from steps 11 and 13. Take the
   //     SHA512 hash of that concatenation. The recipient's MAC Key is the first
   //     32 bytes of that hash.
   let hash: Uint8Array = NaCl.hash(Uint8Array.from(
    ...Uint8Array.from(longTermBox.slice(-32)),
    ...Uint8Array.from(ephemeralBox.slice(-32)),
   ))

   return hash.slice(0, 32)
  })
 }
}

export class Reciever {

 private recipientKeyPair: KeyPair.Value

 constructor(
  recipientKeyPair: KeyPair.Value
 ) {
  this.recipientKeyPair = recipientKeyPair
 }

 // Recipients parse the header of a message using the following steps:
 export const decoder: D.Decoder<unknown, Packet> = pipe(
  Bytes.decoder,
  // 1. Deserialize the header bytes from the message stream using MessagePack.
  //    (What's on the wire is twice-encoded, so the result of unpacking will be
  //    once-encoded bytes.)
  MP.decoder,
  D.parse(a => {
   // 2. Compute the crypto_hash (SHA512) of the bytes from #1 to give the header hash.
   let headerHash = NaCl.hash(a)
   // 3. Deserialize the bytes from #1 again using MessagePack to give the header list.
   let theList = pipe(
    () => a,
    MP.Codec.decode,
    E.chain(PacketList.Codec.decode),
   )
   // 4. Sanity check the format name, version, and mode.
   if ( isLeft(theList) ) {
    return D.failure(a, JSON.stringify(theList))
   }
   let [
    formatName,
    version,
    mode,
    ephemeralPublicKey,
    senderSecretBox,
    recipientsList,
   ] = theList.right

   // 5. Precompute the ephemeral shared secret using crypto_box_beforenm with
   // the ephemeral public key and the recipient's private key.
   let ephemeralSharedSecret = NaCl.box.before(
    ephemeralPublicKey,
    this.recipientKeyPair.privateKey
   )

   // 6. Try to open each of the payload key boxes in the recipients list using
   // crypto_box_open_afternm, the precomputed secret from #5, and the nonce
   // saltpack_recipsbXXXXXXXX. XXXXXXXX is 8-byte big-endian unsigned recipient
   // index, where the first recipient is index 0. Successfully opening one gives
   // the payload key.
   let payloadKey = recipientsList.reduce((acc, item, index) => {
    if (!acc) {
     let attempt = NaCl.box.after(
      item,
      RecipientPublicKey.nonce(index),
      ephemeralSharedSecret
     )
     if (attempt) {
      return attempt
     }
    }
   })
   if (!payloadKey) {
    return D.failure(a, 'no payload key found for our keypair')
   }

   // 7. Open the sender secretbox using crypto_secretbox_open with the payload
   // key from #6 and the nonce saltpack_sender_key_sbox.
   let senderSecret = NaCl.secretbox.open(senderSecretBox, NONCE, payloadKey)

   // 8. Compute the recipient's MAC key as in steps 9-14 above.
  })
 )
}
