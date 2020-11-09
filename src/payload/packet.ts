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
  index: number,
  finalFlag: FinalFlag.Value,
  header: HeaderPacket.Sender,
  chunk: Chunk.Value,
 ) {
  this.finalFlag = finalFlag
  this.payloadSecretBox = PayloadSecretBox.generate(index, chunk, header.payloadKeyPair())
  this.authenticators = header.macs().map(
   (recipientMacKey, recipientIndex) => AuthenticatorsList.calculate(
    header.hash(),
    this.finalFlag,
    this.payloadSecretBox,
    recipientIndex,
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

 constructor(
  header: HeaderPacket.Receiver,
  payloadPacked: MP.Encoded,
 ) {
  this._header = header
  let maybePayload = this.decoder.decode(payloadPacked)
 }

 public decoder: D.Decoder<unknown, PacketList.Value> = {
  decode: (a: unknown) => {
   return pipe(
    Bytes.Codec.decode(a),
    E.chain(MP.Codec.decode),
    E.chain(value => {
     console.log(value)
     let maybeTheList = PacketList.Codec.decode(value)
     console.log(maybeTheList)
     console.log(this._header)
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
      this._header.recipientIndex(),
      this._header.recipientMac(),
      theList[1][this._header.recipientIndex()],
     )) {
      return D.failure(value, 'failed authenticator check')
     }

     let chunk = NaCl.secretbox.open(
      theList[2],
      Nonce.indexed(
       PayloadSecretBox.NONCE_PREFIX,
       this._header.recipientIndex(),
      ),
      this._header.payloadKey(),
     )
     console.log('chunk', chunk)

     return D.success(theList)
    })
   )
  }
 }
}
