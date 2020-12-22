import * as Mocha from 'mocha'
import * as Packet from './packet'
import { strict as assert } from 'assert'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from './recipient_public_key'
import * as Mode from './mode'
import * as MP from '../messagepack/messagepack'

Mocha.describe('Packet', () => {
  Mocha.describe('Sender', () => {
    Mocha.it('should round trip', function () {
      const mode: Mode.Value = Mode.Value.Encryption
      const senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
      const bob: BoxKeyPair.Value = BoxKeyPair.generate()
      const carol: BoxKeyPair.Value = BoxKeyPair.generate()
      const recipientPublicKeys: RecipientPublicKey.Values = [
        bob,
        carol
      ].map(kp => kp.publicKey)
      const visibleRecipients: boolean = false

      const sender = new Packet.Sender(mode, senderKeyPair, recipientPublicKeys, visibleRecipients)

      const bobReceiver = new Packet.Receiver(bob, MP.decode(sender.packetWire()))

      assert.deepEqual(
        bobReceiver.packet(),
        sender.packet()
      )

      const carolReceiver = new Packet.Receiver(carol, MP.decode(sender.packetWire()))
      assert.deepEqual(
        carolReceiver.packet(),
        sender.packet()
      )

      const sam: BoxKeyPair.Value = BoxKeyPair.generate()
      try {
        new Packet.Receiver(sam, MP.decode(sender.packetWire()))
        assert.ok(false)
      } catch (e) {
        assert.ok(
          e.toString().includes('no payload key found for our keypair')
        )
      }
    })
  })
})
