import * as FinalFlag from './final_flag'
import * as AuthenticatorsList from './authenticators_list'
import * as PayloadSecretBox from './payload_secretbox'
import * as PacketList from './packet_list'
import * as MP from '../messagepack/messagepack'
import * as HeaderPacket from '../header/packet'
import * as Chunk from './chunk'

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
