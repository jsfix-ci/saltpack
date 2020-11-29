import * as Mocha from 'mocha'
import * as Chunk from './chunk'
import { strict as assert } from 'assert'

Mocha.describe('Chunk stream', () => {
  Mocha.describe('streaming', () => {
    Mocha.it('should chunk', function () {
      const size = 3
      /* eslint-disable prefer-const */
      for (let [input, expected] of [
        [[], []],
        [[0], [{ data: Buffer.from([0]), final: true, index: 0 }]],
        [[0, 1], [{ data: Buffer.from([0, 1]), final: true, index: 0 }]],
        [[0, 1, 2], [{ data: Buffer.from([0, 1, 2]), final: true, index: 0 }]],
        [[0, 1, 2, 3], [
          { data: Buffer.from([0, 1, 2]), final: false, index: 0 },
          { data: Buffer.from([3]), final: true, index: 1 }
        ]]
      ]) {
        const stream = Chunk.chunkStream(size)
        const output:Array<any> = []
        stream.on('data', (data) => output.push(data))
        stream.write(Buffer.from(input))
        stream.end()
        console.log(output)
        assert.deepEqual(expected, output)
      }
    })
  })
})
