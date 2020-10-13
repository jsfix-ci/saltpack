import { SenderSecretBox } from './sender_secretbox'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('SenderSecretBox', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[SenderSecretBox, SenderSecretBox.Encoded, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    assert.deepEqual(Buffer.from(portable), unpack(pack(value.encode())))
    assert.deepEqual(value, SenderSecretBox.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     new SenderSecretBox(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])),
     Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
     [196, 32, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
    ],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    SenderSecretBox.decode(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('SenderSecretBox failed to decode "saltpack"'),
   )
  })
 })
})
