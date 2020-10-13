import { SenderSecretBox } from './sender_secretbox'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('SenderSecretBox', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[SenderSecretBox.Value, SenderSecretBox.Portable, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, SenderSecretBox.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(SenderSecretBox.toPortable(value)))
    assert.deepEqual(Buffer.from(portable), unpack(pack(SenderSecretBox.toPortable(value))))
    assert.deepEqual(value, SenderSecretBox.fromPortable(unpack(pack(SenderSecretBox.toPortable(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [
     {
      secretBox: Uint8Array.from([1, 2, 3, 4, 5])
     },
     Uint8Array.from([1, 2, 3, 4, 5]),
     [196, 5, 1, 2, 3, 4, 5]
    ],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    SenderSecretBox.fromPortable(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('failed to parse a SenderSecretBox from: "saltpack"'),
   )
  })
 })
})
