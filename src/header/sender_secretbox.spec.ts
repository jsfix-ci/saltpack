import { SenderSecretBox, Value, value, parse } from './sender_secretbox'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('SenderSecretBox', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[SenderSecretBox, Value, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [sender_secretbox, v, packed] = test
    assert.deepEqual(v, value(sender_secretbox))
    assert.deepEqual(Buffer.from(packed), pack(value(sender_secretbox)))
    assert.deepEqual(Buffer.from(v), unpack(pack(value(sender_secretbox))))
    assert.deepEqual(sender_secretbox, parse(unpack(pack(value(sender_secretbox)))))
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
    parse(unpack(Buffer.from([168, 115, 97, 108, 116, 112, 97, 99, 107]))),
    Error('failed to parse a SenderSecretBox from: "saltpack"'),
   )
  })
 })
})
