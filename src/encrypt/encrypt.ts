import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as RecipientPublicKeys from '../header/recipient_public_key'
import * as Mode from '../header/mode'
import * as PayloadPacket from '../payload/packet'
import * as FinalFlag from '../payload/final_flag'

export const CHUNK_BYTES = 1000000

export class Encrypt {

 private _wirePackets: Array<Uint8Array>

 wirePackets() {
  return this._wirePackets
 }

 constructor(
  senderKeyPair:BoxKeyPair.Value,
  recipientPublicKeys:RecipientPublicKeys.Values,
  visibleRecipients:boolean,
  data:Uint8Array,
 ) {
  this._wirePackets = []

  let mode: Mode.Value = Mode.Value.Encryption

  let headerPacket = new HeaderPacket.Sender(
   mode,
   senderKeyPair,
   recipientPublicKeys,
   visibleRecipients,
  )

  this._wirePackets.push(headerPacket.packetWire())

  let payloadIndex = 0
  let numberOfChunks = Math.ceil(data.length / CHUNK_BYTES)
  for (payloadIndex = 0; payloadIndex < numberOfChunks; payloadIndex++) {
   let payloadPacket = new PayloadPacket.Sender(
    payloadIndex,
    ( payloadIndex + 1 === numberOfChunks) ? FinalFlag.Value.Final : FinalFlag.Value.NotFinal,
    headerPacket,
    data.slice(payloadIndex * CHUNK_BYTES, Math.min(data.length, (payloadIndex + 1) * CHUNK_BYTES)),
   )
   this._wirePackets.push(payloadPacket.packetWire())
  }
 }

}

export class Decrypt {
 private _header: HeaderPacket.Receiver
 private _chunks: Array<PayloadPacket.Receiver>

 data() {
  return this._chunks.reduce((acc, item) => Uint8Array.from([...acc, ...item.chunk()]), Uint8Array.from([]))
 }

 constructor(
  encrypt: Encrypt,
  recipientKeyPair: BoxKeyPair.Value,
 ) {
  this._header = new HeaderPacket.Receiver(recipientKeyPair, encrypt.wirePackets()[0])
  this._chunks = encrypt.wirePackets().slice(1).map(
   (chunkPacket, chunkIndex) => new PayloadPacket.Receiver(chunkIndex, this._header, chunkPacket)
   )
 }
}
