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
import * as PacketList from './packet_list'
import * as Sha512 from '../ed25519/sha512'
import * as Mac from './mac'
import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/lib/Either'
import * as Nonce from '../nonce/nonce'
import { pipe } from 'fp-ts/lib/pipeable'
import * as PayloadSecretBox from '../payload/payload_secretbox'

export class Sender {
 private _payloadKeyPair: BoxKeyPair.Value
 private _ephemeralKeyPair: BoxKeyPair.Value

 private senderSecretBox: SenderSecretBox.Value
 private recipientsList: RecipientsList.Value

 private theList: PacketList.Value
 private theListPacked: MP.Encoded

 private headerHash: Sha512.Value
 private headerPacked: MP.Encoded

 private _macs: Mac.Values

 payloadKeyPair():BoxKeyPair.Value {
  return this._payloadKeyPair
 }

 ephemeralKeyPair():BoxKeyPair.Value {
  return this._ephemeralKeyPair
 }

 hash():Sha512.Value {
  return this.headerHash
 }

 macs(): Mac.Values {
  return this._macs
 }

 packetWire() {
  return this.headerPacked
 }

 packet() {
  return this.theList
 }

 // When composing a message, the sender follows these steps to generate the header:
 constructor(
  mode: Mode.Value,
  senderKeyPair: BoxKeyPair.Value,
  recipientPublicKeys: RecipientPublicKey.Values,
  visibleRecipients: boolean,
 ) {
  // 1. Generate a random 32-byte payload key.
  this._payloadKeyPair = BoxKeyPair.generate()

  // 2. Generate a random ephemeral keypair, using crypto_box_keypair.
  this._ephemeralKeyPair = BoxKeyPair.generate()

  // 3. Encrypt the sender's long-term public key using crypto_secretbox with
  //    the payload key and the nonce saltpack_sender_key_sbox, to create the
  //    sender secretbox.
  this.senderSecretBox = NaCl.secretbox(
   senderKeyPair.publicKey,
   SenderKeyNonce.NONCE,
   this.payloadKeyPair().secretKey,
  )

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
     this.payloadKeyPair().secretKey,
     Nonce.indexed(RecipientPublicKey.NONCE_PREFIX, index),
     recipientPublicKey,
     this.ephemeralKeyPair().secretKey,
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
   this.ephemeralKeyPair().publicKey,
   this.senderSecretBox,
   this.recipientsList,
  ]

  // 6. Serialize the list from #5 into a MessagePack array object.
  this.theListPacked = MP.Codec.encode(PacketList.Codec.encode(this.theList))

  // 7. Take the crypto_hash (SHA512) of the bytes from #6. This is the header
  //    hash.
  this.headerHash = NaCl.hash(this.theListPacked)

  // 8. Serialize the bytes from #6 again into a MessagePack bin object. These
  //    twice-encoded bytes are the header packet.
  this.headerPacked = MP.Codec.encode(this.theListPacked)

  //    After generating the header, the sender computes each recipient's MAC
  //    key, which will be used below to authenticate the payload:
  this._macs = recipientPublicKeys.map((recipientPublicKey, index) =>
   Mac.calculate(
    this.headerHash,
    index,
    // @todo support anon sending
    senderKeyPair.secretKey,
    recipientPublicKey,
    this.ephemeralKeyPair().secretKey,
    recipientPublicKey,
   )
  )
 }
}

export class Receiver {

 private _recipientKeyPair: BoxKeyPair.Value
 // This is either set by the constructor during decoding or the decoding fails
 // and the constructor throws an error but the compiler doesn't seem to know
 // that so we add !
 private _mac!: Mac.Value
 private _recipientIndex!: number
 private theList: PacketList.Value

 private _headerHash: Sha512.Value

 private _payloadKey!: PayloadSecretBox.Value

 headerHash() {
  return this._headerHash
 }

 recipientKeyPair() {
  return this._recipientKeyPair
 }

 recipientIndex() {
  return this._recipientIndex
 }

 recipientMac() {
  return this._mac
 }

 payloadKey() {
  return this._payloadKey
 }

 packet() {
  return this.theList
 }

 constructor(
  recipientKeyPair: BoxKeyPair.Value,
  theListPacked: MP.Encoded,
 ) {
  this._recipientKeyPair = recipientKeyPair
  let maybeTheList = this.decoder.decode(theListPacked)
  if (E.isRight(maybeTheList)) {
   this.theList = maybeTheList.right
  } else {
   throw new Error(JSON.stringify(maybeTheList))
  }
 }

 // Recipients parse the header of a message using the following steps:
 public decoder: D.Decoder<unknown, PacketList.Value> = {
  decode: (a: unknown) => {
   return pipe(
    Bytes.Codec.decode(a),
    // 1. Deserialize the header bytes from the message stream using MessagePack.
    //    (What's on the wire is twice-encoded, so the result of unpacking will be
    //    once-encoded bytes.)
    E.chain(MP.Codec.decode),
    E.chain(Bytes.Codec.decode),
    E.chain(value => {

     // 2. Compute the crypto_hash (SHA512) of the bytes from #1 to give the header hash.
     this._headerHash = NaCl.hash(value)

     // 3. Deserialize the bytes from #1 again using MessagePack to give the header list.
     let maybeTheList = pipe(
      MP.Codec.decode(value),
      E.chain(PacketList.Codec.decode),
     )

     // 4. Sanity check the format name, version, and mode.
     if ( E.isLeft(maybeTheList) ) {
      return D.failure(value, JSON.stringify(maybeTheList))
     }
     let theList: PacketList.Value = maybeTheList.right
     let [
      formatName,
      version,
      mode,
      ephemeralPublicKey,
      senderSecretBox,
      recipientsList,
     ] = theList

     // 5. Precompute the ephemeral shared secret using crypto_box_beforenm with
     // the ephemeral public key and the recipient's private key.
     let ephemeralSharedSecret = NaCl.box.before(
      ephemeralPublicKey,
      this.recipientKeyPair().secretKey,
     )

     // 6. Try to open each of the payload key boxes in the recipients list using
     // crypto_box_open_afternm, the precomputed secret from #5, and the nonce
     // saltpack_recipsbXXXXXXXX. XXXXXXXX is 8-byte big-endian unsigned recipient
     // index, where the first recipient is index 0. Successfully opening one gives
     // the payload key.
     let [ payloadKey, index ] = recipientsList.reduce(( acc:[ Bytes.Value|null, number ], item:RecipientsList.Item, index:number ) => {
      if (!acc[0]) {
       let attempt = NaCl.box.open.after(
        item[1],
        Nonce.indexed(RecipientPublicKey.NONCE_PREFIX, index),
        ephemeralSharedSecret
       )
       if (attempt) {
        return [ attempt, index ]
       }
      }
      return acc
     }, [ null, 0 ])
     if (payloadKey === null) {
      return D.failure(value, 'no payload key found for our keypair')
     }
     this._recipientIndex = index
     this._payloadKey = payloadKey

     // 7. Open the sender secretbox using crypto_secretbox_open with the payload
     // key from #6 and the nonce saltpack_sender_key_sbox.
     let senderPublicKey = NaCl.secretbox.open(
      senderSecretBox,
      SenderKeyNonce.NONCE,
      this.payloadKey()
     )

     if (senderPublicKey === null) {
      return D.failure(value, 'failed to decrypt sender public key')
     }

     // 8. Compute the recipient's MAC key as in steps 9-14 above.
     this._mac = Mac.calculate(
      this.headerHash(),
      index,
      this.recipientKeyPair().secretKey,
      senderPublicKey,
      this.recipientKeyPair().secretKey,
      ephemeralPublicKey,
     )

     return D.success(theList)
    })
   )
  }
 }
}
