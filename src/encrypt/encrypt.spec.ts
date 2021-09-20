import * as Mocha from 'mocha'
import * as Encrypt from './encrypt'
import * as BoxKeyPair from '../ed25519/box_keypair'
import * as BoxKeyPairFixture from '../ed25519/box_keypair.fixture'
import * as RecipientPublicKey from '../header/recipient_public_key'
import * as FS from 'fs'
import * as Path from 'path'
import * as Tmp from 'tmp'
import { strict as assert } from 'assert'
import * as MPLib from '@msgpack/msgpack'
const FileType = require('file-type')

const path = Path.join(__dirname, '..', '..', 'fixture', 'Big_Buck_Bunny_1080_10s_5MB.mp4')

Mocha.describe('Encrypt', () => {
  Mocha.describe('build', () => {
    Mocha.it('should round trip', async function () {
      this.timeout(10000)

      for (let senderKeyPair of [BoxKeyPairFixture.alice, null]) {
        const readStream = FS.createReadStream(path)

        const bob: BoxKeyPair.Value = BoxKeyPair.generate()
        const carol: BoxKeyPair.Value = BoxKeyPair.generate()
        const recipientPublicKeys: RecipientPublicKey.Values = [
          bob,
          carol
        ].map(kp => kp.publicKey)
        const visibleRecipients: boolean = false

        const encryptStream = Encrypt.Encrypt(
          senderKeyPair,
          recipientPublicKeys,
          visibleRecipients
        )

        const decryptStreams = [Encrypt.Decrypt(bob), Encrypt.Decrypt(carol)]

        readStream.pipe(encryptStream)

        for (const decryptStream of decryptStreams) {
          const tmpFile = Tmp.fileSync()
          const writeStream = FS.createWriteStream(tmpFile.name)
          writeStream.on('close', async () => {
            // A correct decryption should allow us to inspect the movie.
            assert.deepEqual(
              { ext: 'mp4', mime: 'video/mp4' },
              await FileType.fromFile(tmpFile.name)
            )
          })
          decryptStream.pipe(writeStream)
        }

        const badRecipient = BoxKeyPair.generate()
        const badStream = Encrypt.Decrypt(badRecipient)
        let badErrored = false
        badStream.on('error', (error:Error) => {
          assert.ok(('' + error).includes('error":"no payload key found for our keypair'))
          badErrored = true
        })

        for await (const item of MPLib.decodeStream(encryptStream)) {
          for (const decryptStream of decryptStreams) {
            decryptStream.write(item)
          }
          badStream.write(item)
        }

        assert.ok(badErrored)
        assert.ok(badStream.destroyed)
      }
    })

    Mocha.it('should round trip through a file', async function () {
      this.timeout(5000)

      const tmpFile = Tmp.fileSync()
      const bob = BoxKeyPair.generate()

      await new Promise((resolve, reject) => {
        const readStream = FS.createReadStream(path)

        const senderKeyPair: BoxKeyPair.Value = BoxKeyPairFixture.alice
        const encryptStream = Encrypt.Encrypt(
          senderKeyPair,
          [bob.publicKey],
          false
        )

        const writeStream = FS.createWriteStream(tmpFile.name)

        readStream.pipe(encryptStream)
        encryptStream.pipe(writeStream)

        writeStream.on('close', resolve)
      })

      // Encrypted data cannot be read as media.
      assert.deepEqual(
        undefined,
        await FileType.fromFile(tmpFile.name)
      )

      const readStream = FS.createReadStream(tmpFile.name)
      const decryptStream = Encrypt.Decrypt(
        bob
      )

      const outTmpFile = Tmp.fileSync()
      const writeStream = FS.createWriteStream(outTmpFile.name)

      decryptStream.pipe(writeStream)

      for await (const item of MPLib.decodeStream(readStream)) {
        decryptStream.write(item)
      }

      await new Promise((resolve, reject) => {
        writeStream.on('close', resolve)
      })

      // A correct decryption should allow us to inspect the movie.
      assert.deepEqual(
        { ext: 'mp4', mime: 'video/mp4' },
        await FileType.fromFile(outTmpFile.name)
      )

    })
  })
})
