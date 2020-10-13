import { FormatName } from './format_name'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('FormatName', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[FormatName, FormatName.Encoded, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    assert.deepEqual(encoded, unpack(pack(value.encode())))
    assert.deepEqual(value, FormatName.decode(unpack(pack(value.encode()))))
   }
  }

  it('each FormatName has the correct pack value', () => {
   testPackValue([
    [new FormatName(FormatName.Value.SaltPack), "saltpack", [168, 115, 97, 108, 116, 112, 97, 99, 107]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known FormatName
   assert.deepEqual(
    FormatName.decode("Saltpack"),
    Error('FormatName failed to decode "Saltpack"'),
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    FormatName.decode(unpack(Buffer.from([145, 3]))),
    Error('FormatName failed to decode [3]'),
   )
  })
 })
})
