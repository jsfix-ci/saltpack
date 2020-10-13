import { FormatName } from './format_name'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('FormatName', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[FormatName.Value, FormatName.Portable, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, FormatName.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(FormatName.toPortable(value)))
    assert.deepEqual(portable, unpack(pack(FormatName.toPortable(value))))
    assert.deepEqual(value, FormatName.fromPortable(unpack(pack(FormatName.toPortable(value)))))
   }
  }

  it('each FormatName has the correct pack value', () => {
   testPackValue([
    [FormatName.Value.SaltPack, "saltpack", [168, 115, 97, 108, 116, 112, 97, 99, 107]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known FormatName
   assert.deepEqual(
    FormatName.fromPortable("Saltpack"),
    Error('failed to parse a FormatName from: "Saltpack"'),
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    FormatName.fromPortable(unpack(Buffer.from([145, 3]))),
    Error('failed to parse a FormatName from: [3]'),
   )
  })
 })
})
