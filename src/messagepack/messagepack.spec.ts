import { pack, unpack } from './messagepack'
import 'mocha'
import { strict as assert } from 'assert'

describe('Messagepack', () => {
 describe('round trip', () => {
  const roundTest = (tests:Array<[any, any]>) => {
   for (let test of tests) {
    let [ input, expected ] = test
    let output = pack(input)
    let round = unpack(output)
    assert.deepEqual(output, Buffer.from(expected))
    assert.deepEqual(round, input)
   }
  }

  it('should round strings', () => {
   roundTest([
    ["", [ 160 ]],
    ["some string", [ 171, 115, 111, 109, 101, 32, 115, 116, 114, 105, 110, 103 ]]
   ])
  })

  it('should round number', () => {
   roundTest([
    // this is a float being treated as an int by messagepack
    [1, [1]],
    // this is subtle, commonly languages treat `1` as an int literal and
    // `1.0` as a float literal but js only has floats so `1` and `1.0` seem to
    // be treated as the same thing by messagepack... an int!
    [1.0, [1]],
    // this is subtle, it shows that as soon as we move away from something that
    // is intepreted by messagepack as an int then the encoding representation
    // is completely different as a float which we don't want showing up in e.g.
    // our header version, etc.
    [1.1, [203, 63, 241, 153, 153, 153, 153, 153, 154]],
    [2, [2]],
    [2.0, [2]],
    [[0], [145, 0]],
    [[1], [145, 1]],
    [[1.0], [145, 1]],
    [[1, 0], [146, 1, 0]],
    [[1.0, 0.0], [146, 1, 0]],
    [[2, 0], [146, 2, 0]],
    [[2.0, 0.0], [146, 2, 0]],
   ])
  })

  // this shows why js big integers are _not_ what we want for saltpack.
  // somewhat counterintuitive as 'big' integers are the _only_ integers in js.
  // clearly an 8 byte representation of an integer is not
  // "the encoding that will use the fewest number of bytes"
  it('should round big int', () => {
   roundTest([
    [1n, [211, 0, 0, 0, 0, 0, 0, 0, 1]],
    [2n, [211, 0, 0, 0, 0, 0, 0, 0, 2]],
    [[1n, 0n], [146, 211, 0, 0, 0, 0, 0, 0, 0, 1, 211, 0, 0, 0, 0, 0, 0, 0, 0]],
    [[2n, 0n], [146, 211, 0, 0, 0, 0, 0, 0, 0, 2, 211, 0, 0, 0, 0, 0, 0, 0, 0]]
   ])
  })
 })
})
