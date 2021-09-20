import * as Mocha from 'mocha'
import * as Packet from './packet'
import * as HeaderPacket from '../header/packet'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import * as FinalFlag from './final_flag'
import * as MP from '../messagepack/messagepack'
import { strict as assert } from 'assert'

Mocha.describe('Packet', () => {
  Mocha.describe('Sender', () => {
    Mocha.it('should round trip', () => {
      const senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
      const bob: BoxKeyPair.Value = BoxKeyPair.generate()
      const carol: BoxKeyPair.Value = BoxKeyPair.generate()
      const sam: BoxKeyPair.Value = BoxKeyPair.generate()
      const recipientPublicKeys: RecipientPublicKey.Values = [
        bob,
        carol
      ].map(kp => kp.publicKey)
      const visibleRecipients: boolean = false
      const mode = 0
      const finalFlag = FinalFlag.Value.NotFinal
      const header = new HeaderPacket.Sender(
        mode,
        senderKeyPair,
        recipientPublicKeys,
        visibleRecipients
      )

      const chunks = [
        Uint8Array.from([1, 2, 3]),
        Uint8Array.from([4, 5, 6, 7, 8, 9]),
      ]
      const bobReceiverHeader = new HeaderPacket.Receiver(bob, MP.decode(header.packetWire()))
      const carolReceiverHeader = new HeaderPacket.Receiver(carol, MP.decode(header.packetWire()))

      // Bob and carol can open both chunks.
      chunks.map((chunk, chunkIndex) => {
        const sender = new Packet.Sender(
          chunkIndex,
          finalFlag,
          header,
          chunk
        );

        [bobReceiverHeader, carolReceiverHeader].map((recipientHeader, recipientIndex) => {
          assert.deepEqual(
            new Packet.Receiver(chunkIndex, recipientHeader, MP.decode(sender.packetWire())).chunk(),
            chunks[chunkIndex],
          )
        })
      })

      // Opening a box not for us is an error.
      try {
        new HeaderPacket.Receiver(sam, MP.decode(header.packetWire()))
        assert.ok(false)
      } catch (e) {
        assert.ok(('' + e).includes('no payload key found for our keypair'))
      }
    })
  })
})
