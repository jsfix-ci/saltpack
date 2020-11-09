import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as RecipientPublicKeys from '../header/recipient_public_key'
import * as Mode from '../header/mode'
// import * as PayloadPacket from '../payload/packet_list'
//
export class Encrypt {

 private headerPacket:HeaderPacket.Sender
 // private payloadPacket:PayloadPacket.Value

 constructor(
  senderKeyPair:BoxKeyPair.Value,
  recipientPublicKeys:RecipientPublicKeys.Values,
  visibleRecipients:boolean,
 ) {
  let mode: Mode.Value = Mode.Value.Encryption

  this.headerPacket = new HeaderPacket.Sender(
   mode,
   senderKeyPair,
   recipientPublicKeys,
   visibleRecipients,
  )
 }

 headerWire() {
  return this.headerPacket.packetWire()
 }

 // payloadWire() {
 //  return this.payloadPacket.packetWire()
 // }

}
