import * as Packet from './packet'
import { strict as assert } from 'assert'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from './recipient_public_key'
import * as Mode from './mode'
import * as MP from '../messagepack/messagepack'

describe('Packet', () => {
 describe('Sender', () => {
  it('should round trip', () => {
   let mode: Mode.Value = Mode.Value.Encryption
   let senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
   let bob: BoxKeyPair.Value = BoxKeyPair.generate()
   let carol: BoxKeyPair.Value = BoxKeyPair.generate()
   let recipientPublicKeys: RecipientPublicKey.Values = [
    bob,
    carol,
   ].map(kp => kp.publicKey)
   let visibleRecipients: boolean = false

   let sender = new Packet.Sender(mode, senderKeyPair, recipientPublicKeys, visibleRecipients)

   let bobReceiver = new Packet.Reciever(bob, sender.packetWire())

   assert.deepEqual(
    bobReceiver.packet(),
    sender.packet(),
   )

   let carolReceiver = new Packet.Reciever(carol, sender.packetWire())
   assert.deepEqual(
    carolReceiver.packet(),
    sender.packet(),
   )

   let sam: BoxKeyPair.Value = BoxKeyPair.generate()
   try {
    new Packet.Reciever(sam, sender.packetWire())
    assert.ok(false)
   } catch (e) {
    assert.ok(
     e.toString().includes('no payload key found for our keypair')
    )
   }
  })
 })
})
