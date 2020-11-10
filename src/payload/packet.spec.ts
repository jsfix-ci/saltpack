import * as Packet from './packet'
import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import * as FinalFlag from './final_flag'
import * as AuthenticatorsList from './authenticators_list'
import { strict as assert } from 'assert'

describe('Packet', () => {
 describe('Sender', () => {
  it('should round trip', () => {

   let senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
   let bob: BoxKeyPair.Value = BoxKeyPair.generate()
   let carol: BoxKeyPair.Value = BoxKeyPair.generate()
   let sam: BoxKeyPair.Value = BoxKeyPair.generate()
   let recipientPublicKeys: RecipientPublicKey.Values = [
    bob,
    carol,
   ].map(kp => kp.publicKey)
   let visibleRecipients: boolean = false
   let mode = 0
   let finalFlag = FinalFlag.Value.NotFinal
   let header = new HeaderPacket.Sender(
    mode,
    senderKeyPair,
    recipientPublicKeys,
    visibleRecipients,
   )

   let chunks = [
    Uint8Array.from([1, 2, 3]),
    Uint8Array.from([4, 5, 6, 7, 8, 9]),
   ]
   let bobReceiverHeader = new HeaderPacket.Receiver(bob, header.packetWire())
   let carolReceiverHeader = new HeaderPacket.Receiver(carol, header.packetWire())

   // Bob and carol can open both chunks.
   chunks.map((chunk, chunkIndex) => {
    let sender = new Packet.Sender(
     chunkIndex,
     finalFlag,
     header,
     chunk,
    );

    [bobReceiverHeader, carolReceiverHeader].map((recipientHeader, recipientIndex) => {
     assert.deepEqual(
      new Packet.Receiver(chunkIndex, recipientHeader, sender.packetWire()).chunk(),
      chunks[chunkIndex],
     )
    })
   })

   // Opening a box not for us is an error.
   try {
    new HeaderPacket.Receiver(sam, header.packetWire())
    assert.ok(false)
   } catch (e) {
    assert.ok((''+ e).includes('no payload key found for our keypair'))
   }
  })
 })
})
