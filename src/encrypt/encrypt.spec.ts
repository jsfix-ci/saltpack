import * as Mocha from 'mocha'
import * as Encrypt from './encrypt'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import { strict as assert } from 'assert'

Mocha.describe('Encrypt', () => {
  Mocha.describe('build', () => {
    Mocha.it('should round trip', function () {
      this.timeout(0)

      const senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
      const bob: BoxKeyPair.Value = BoxKeyPair.generate()
      const carol: BoxKeyPair.Value = BoxKeyPair.generate()
      const recipientPublicKeys: RecipientPublicKey.Values = [
        bob,
        carol,
      ].map(kp => kp.publicKey)
      const visibleRecipients: boolean = false

      const data = Uint8Array.from(Array(3000100))

      const encrypt = new Encrypt.Encrypt(
        senderKeyPair,
        recipientPublicKeys,
        visibleRecipients,
        data,
      )

      for (const recipient of [bob, carol]) {
        const decrypt = new Encrypt.Decrypt(
          encrypt.wirePackets(),
          recipient
        )

        assert.deepEqual(
          decrypt.data(),
          data
        )
      }

      const sam: BoxKeyPair.Value = BoxKeyPair.generate()
      try {
        const decrypt = new Encrypt.Decrypt(
          encrypt.wirePackets(),
          sam
        )
        // Unreachable!
        assert.ok(false)
        // This is just using the value for the linter.
        assert.ok(decrypt)
      } catch (e) {
        assert.ok(('' + e).includes('no payload key found for our keypair'))
      }
    })
  })
})
