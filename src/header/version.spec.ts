import { Version } from './version'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Version', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Version.Value, Version.Portable, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, portable, packed] = test
    assert.deepEqual(portable, Version.toPortable(value))
    assert.deepEqual(Buffer.from(packed), pack(Version.toPortable(value)))
    assert.deepEqual(portable, unpack(pack(Version.toPortable(value))))
    assert.deepEqual(value, Version.fromPortable(unpack(pack(Version.toPortable(value)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Version.Value.One, [ 1, 0 ], [146, 1, 0]],
    [Version.Value.Two, [ 2, 0 ], [146, 2, 0]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Error('failed to parse a Version from: [3,0]'),
    Version.fromPortable([3, 0])
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Error('failed to parse a Version from: [3]'),
    Version.fromPortable(unpack(Buffer.from([145, 3])))
   )
  })
 })
})
