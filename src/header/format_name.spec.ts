import { FormatName, Value, value, parse } from './format_name'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('FormatName', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[FormatName, Value, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [format_name, v, packed] = test
    assert.deepEqual(v, value(format_name))
    assert.deepEqual(Buffer.from(packed), pack(value(format_name)))
    assert.deepEqual(v, unpack(pack(value(format_name))))
    assert.deepEqual(format_name, parse(unpack(pack(value(format_name)))))
   }
  }

  it('each FormatName has the correct pack value', () => {
   testPackValue([
    [FormatName.SaltPack, "saltpack", [168, 115, 97, 108, 116, 112, 97, 99, 107]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known FormatName
   assert.deepEqual(
    Error('failed to parse a FormatName from: "Saltpack"'),
    parse("Saltpack")
   )

   // this error happens when a runtime unpack subverts typescript type rails
   assert.deepEqual(
    Error('failed to parse a FormatName from: [3]'),
    parse(unpack(Buffer.from([145, 3])))
   )
  })
 })
})
