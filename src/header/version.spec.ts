import { Version } from './version'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Version', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Version, Version.Encoded, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [value, encoded, packed] = test
    assert.deepEqual(encoded, value.encode())
    assert.deepEqual(Buffer.from(packed), pack(value.encode()))
    assert.deepEqual(encoded, unpack(pack(value.encode())))
    assert.deepEqual(value, Version.decode(unpack(pack(value.encode()))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [new Version(Version.Value.One), [ 1, 0 ], [146, 1, 0]],
    [new Version(Version.Value.Two), [ 2, 0 ], [146, 2, 0]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Error('Version failed to decode [3,0]'),
    Version.decode([3, 0])
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Error('Version failed to decode [3]'),
    Version.decode(unpack(Buffer.from([145, 3])))
   )
  })
 })
})
