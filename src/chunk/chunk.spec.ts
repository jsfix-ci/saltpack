import * as Mocha from 'mocha'
import * as Chunk from './chunk'
import { strict as assert } from 'assert'

Mocha.describe('Chunk stream', () => {
  Mocha.describe('streaming', () => {
    Mocha.it('should chunk', function () {
      const size = 3
      /* eslint-disable prefer-const */
      for (let [input, expected] of [
        // Empty chunks need to be handled.
        [[], []],
        [[0], [{ data: Buffer.from([0]), final: true, index: 0 }]],
        [[0, 1], [{ data: Buffer.from([0, 1]), final: true, index: 0 }]],
        // 3 bytes is exactly one chunk.
        [[0, 1, 2], [{ data: Buffer.from([0, 1, 2]), final: true, index: 0 }]],
        // More than 3 bytes means 2 chunks.
        // 2 chunks means we can see the final false and true.
        // 2 chunks means we can see the index.
        [[0, 1, 2, 3], [
          { data: Buffer.from([0, 1, 2]), final: false, index: 0 },
          { data: Buffer.from([3]), final: true, index: 1 }
        ]]
      ]) {
        const stream = Chunk.stream(size)
        const output:Array<any> = []
        stream.on('data', (data) => output.push(data))

        // Force write the input to the stream, don't worry about backpressure
        // for testing.
        stream.write(Buffer.from(input))

        // Important to end the stream when we are done with it.
        stream.end()

        assert.deepEqual(expected, output)
      }
    })

    Mocha.it('should bulk chunk', function () {

      const stream = Chunk.stream(3)
      const output:Array<any> = []
      stream.on('data', (data) => output.push(data))

      // Irregular inputs that don't line up with the underlying chunk size.
      stream.write(Buffer.from([1, 2]))
      stream.write(Buffer.from([3, 4]))
      stream.write(Buffer.from([5]))
      stream.write(Buffer.from([]))
      stream.write(Buffer.from([6, 7, 8]))

      stream.end()

      assert.deepEqual(
        output,
        [
          {
            data: Buffer.from([1, 2, 3]),
            index: 0,
            final: false
          },
          {
            data: Buffer.from([4, 5, 6]),
            index: 1,
            final: false
          },
          {
            data: Buffer.from([7, 8]),
            index: 2,
            final: true
          }
        ]
      )

    })
  })
})
