import * as Mocha from 'mocha'
import * as Encrypt from './encrypt'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import * as Fs from 'fs'
import { strict as assert } from 'assert'

Mocha.describe('Encrypt', () => {
  Mocha.describe('build', () => {
    Mocha.it('should round trip', function () {
      const senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
      const bob: BoxKeyPair.Value = BoxKeyPair.generate()
      const carol: BoxKeyPair.Value = BoxKeyPair.generate()
      const recipientPublicKeys: RecipientPublicKey.Values = [
        bob,
        carol
      ].map(kp => kp.publicKey)
      const visibleRecipients: boolean = false

      const bytes = Encrypt.CHUNK_BYTES * 3 + 100
      const input = Buffer.alloc(bytes)

      const encryptStream = Encrypt.Encrypt(
        senderKeyPair,
        recipientPublicKeys,
        visibleRecipients
      )

      for (const recipient of [bob, carol]) {
        const decryptStream = Encrypt.Decrypt(
          recipient
        )
        const output = Buffer.alloc(bytes)
        let outputOffset = 0
        decryptStream.on('data', (data:Buffer) => {
          data.copy(output, outputOffset)
          outputOffset += data.length
          assert.ok(outputOffset <= bytes)
        })
        // This should not happen, for debugging the tests only.
        decryptStream.on('error', (error:Error) => console.warn(recipient.publicKey.toString(), error))

        encryptStream.on('data', (data:Buffer) => {
          if (!decryptStream.destroyed) {
            decryptStream.write(data)
          }
        })
        assert.deepEqual(input, output)
      }

      const badRecipient = BoxKeyPair.generate()
      let badAttempted = false
      const badStream = Encrypt.Decrypt(badRecipient)
      badStream.on('data', (data:Buffer) => assert.ok(false))
      badStream.on('error', (error:Error) => assert.ok(('' + error).includes('error":"no payload key found for our keypair')))
      encryptStream.on('data', (data:Buffer) => {
        if (badAttempted) {
          assert.ok(badStream.destroyed)
        }
        // Decrypt streams are destroyed when there is an error.
        if (!badStream.destroyed) {
          badStream.write(data)
          badAttempted = true
        }
      })

      const dataStream = Fs.createReadStream('/dev/urandom', { end: bytes })
      let inputOffset = 0
      dataStream.on('data', (data:Buffer) => {
        data.copy(input, inputOffset)
        inputOffset += data.length
        encryptStream.write(data)
      })
      // encrypt streams must always end() or they will not flush correctly!
      dataStream.on('finish', () => encryptStream.end())

    })
  })
})
