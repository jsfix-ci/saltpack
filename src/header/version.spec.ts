import { Version, Value, value, parse } from './version'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Version', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Version, Value, MessagepackSerializedData]>) => {
   for (let test of tests) {
    let [version, v, packed] = test
    assert.deepEqual(v, value(version))
    assert.deepEqual(Buffer.from(packed), pack(value(version)))
    assert.deepEqual(v, unpack(pack(value(version))))
    assert.deepEqual(version, parse(unpack(pack(value(version)))))
   }
  }

  it('each version has the correct pack value', () => {
   testPackValue([
    [Version.One, [ 1, 0 ], [146, 1, 0]],
    [Version.Two, [ 2, 0 ], [146, 2, 0]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Error('failed to parse a Version from: [3,0]'),
    parse([3, 0])
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Error('failed to parse a Version from: [3]'),
    parse(unpack(Buffer.from([145, 3])))
   )
  })
 })
})
