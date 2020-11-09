import * as Packet from './packet'
import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import * as FinalFlag from './final_flag'
import * as AuthenticatorsList from './authenticators_list'

describe('Packet', () => {
 describe('Sender', () => {
  it('should round trip', () => {

   let senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
   let bob: BoxKeyPair.Value = BoxKeyPair.generate()
   let carol: BoxKeyPair.Value = BoxKeyPair.generate()
   let recipientPublicKeys: RecipientPublicKey.Values = [
    bob,
    carol,
   ].map(kp => kp.publicKey)
   let visibleRecipients: boolean = false
   let mode = 0
   let index = 0
   let finalFlag = FinalFlag.Value.NotFinal
   let header = new HeaderPacket.Sender(
    mode,
    senderKeyPair,
    recipientPublicKeys,
    visibleRecipients,
   )

   let chunk = Uint8Array.from([1, 2, 3])

   let sender = new Packet.Sender(
    index,
    finalFlag,
    header,
    chunk,
   );

   console.log(sender.packetWire().toString())

  })
 })
})
