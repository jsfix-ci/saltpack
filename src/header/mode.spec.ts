import { Mode, value, parse } from './mode'
import { pack, unpack, MessagepackSerializedData } from '../messagepack/messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Mode', () => {
 describe('messagepack', () => {
  const testPackValue = (tests:Array<[Mode, number, MessagepackSerializedData]>) => {
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
    [Mode.Encryption, 0, [0]],
    [Mode.AttachedSigning, 1, [1]],
    [Mode.DetachedSigning, 2, [2]],
    [Mode.Signcryption, 3, [3]],
   ])
  })

  it('parse has some error handling', () => {
   // this error happens when a runtime value is structurally sound according to
   // the typescript type system but doesn't map to any known version
   assert.deepEqual(
    Error('failed to parse a Mode from: 1000'),
    parse(1000)
   )

   // this error happens when a runtime unpack subverts the typescript type
   // system by creating a version tuple with a major but no minor value
   assert.deepEqual(
    Error('failed to parse a Mode from: [3,3]'),
    parse(unpack(Buffer.from([146, 3, 3])))
   )
  })
 })
})
