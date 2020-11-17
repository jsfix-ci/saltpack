import * as FinalFlag from './final_flag'
import * as AuthenticatorsList from './authenticators_list'
import * as PayloadSecretBox from './payload_secretbox'
import * as PacketList from './packet_list'
import * as MP from '../messagepack/messagepack'
import * as HeaderPacket from '../header/packet'
import * as Chunk from './chunk'
import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/lib/pipeable'
import * as E from 'fp-ts/lib/Either'
import * as Bytes from '../bytes/bytes'
import * as NaCl from 'tweetnacl'
import * as Nonce from '../nonce/nonce'

export class Sender {
 private finalFlag: FinalFlag.Value
 private authenticators: AuthenticatorsList.Value
 private payloadSecretBox: PayloadSecretBox.Value

 private theList: PacketList.Value
 private theListPacked: MP.Encoded

 packetWire() {
  return this.theListPacked
 }

 packet() {
  return this.theList
 }

 constructor(
  payloadIndex: number,
  finalFlag: FinalFlag.Value,
  header: HeaderPacket.Sender,
  chunk: Chunk.Value,
 ) {
  this.finalFlag = finalFlag
  this.payloadSecretBox = PayloadSecretBox.generate(payloadIndex, chunk, header.payloadKeyPair())
  this.authenticators = header.macs().map(
   (recipientMacKey, recipientIndex) => AuthenticatorsList.calculate(
    header.hash(),
    this.finalFlag,
    this.payloadSecretBox,
    payloadIndex,
    recipientMacKey
   )
  )

  this.theList = [
   this.finalFlag,
   this.authenticators,
   this.payloadSecretBox,
  ]

  this.theListPacked = MP.Codec.encode(PacketList.Codec.encode(this.theList))
 }
}

export class Receiver {

 private _header: HeaderPacket.Receiver
 private _payloadIndex: number
 private _chunk!: Chunk.Value
 private _theList: PacketList.Value

 payloadIndex():number {
  return this._payloadIndex
 }

 chunk():Chunk.Value {
  return this._chunk
 }

 finalFlag():FinalFlag.Value {
  return this._theList[0]
 }

 constructor(
  payloadIndex: number,
  header: HeaderPacket.Receiver,
  payloadPacked: MP.Encoded,
 ) {
  this._payloadIndex = payloadIndex
  this._header = header

  let maybeTheList = this.decoder.decode(payloadPacked)
  if (E.isRight(maybeTheList)) {
   this._theList = maybeTheList.right
  } else {
   throw new Error(JSON.stringify(maybeTheList))
  }
 }

 public decoder: D.Decoder<unknown, PacketList.Value> = {
  decode: (a: unknown) => {
   return pipe(
    Bytes.Codec.decode(a),
    E.chain(MP.Codec.decode),
    E.chain(value => {
     let maybeTheList = PacketList.Codec.decode(value)

     if ( E.isLeft(maybeTheList) ) {
      return D.failure(value, JSON.stringify(maybeTheList))
     }
     let theList: PacketList.Value = maybeTheList.right

     // The recipient index of each authenticator in the list corresponds to the
     // index of that recipient's payload key box in the header. Before opening the
     // payload secretbox in each payload packet, recipients must first verify the
     // authenticator by repeating steps #1 and #2 and then calling
     // crypto_auth_verify.
     if (!AuthenticatorsList.verify(
      this._header.headerHash(),
      theList[0],
      theList[2],
      this.payloadIndex(),
      this._header.recipientMac(),
      theList[1][this._header.recipientIndex()],
     )) {
      return D.failure(value, 'failed authenticator check')
     }

     let maybeChunk = PayloadSecretBox.open(
      this.payloadIndex(),
      theList[2],
      this._header.payloadKey(),
     )

     if (maybeChunk === null) {
      return D.failure(value, 'failed to decrypt chunk')
     }

     this._chunk = maybeChunk

     return D.success(theList)
    })
   )
  }
 }
}
