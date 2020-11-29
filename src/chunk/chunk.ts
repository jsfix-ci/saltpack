import * as Stream from 'readable-stream'

// Nice references for stream implementations:
// https://codereview.stackexchange.com/questions/57492/chunkertransformstream-a-transform-stream-to-take-arbitrary-chunk-sizes-and-mak
// https://github.com/Olegas/node-chunking-streams
// https://github.com/nodejs/readable-stream

export interface Chunk {
 data: Buffer,
 index: number,
 final: boolean
}

export const chunkStream = (size:number) => {
  // Transform stream to implement and return.
  const stream = new Stream.Transform({ objectMode: true })
  // Buffer to put chunks into until we hit `size` bytes.
  const buffer = Buffer.alloc(size)
  // Position to write the next chunk to in the buffer.
  let bufferAvailable = size
  // Index of the current chunk.
  let index = 0

  stream._transform = (chunk:Buffer, encoding, done) => {
    let chunkAvailable = chunk.length
    let toCopy = Math.min(bufferAvailable, chunkAvailable)

    while (chunkAvailable) {
      // The buffer is full, push and reset it.
      if (!bufferAvailable) {
        stream.push({
          data: Buffer.from(buffer),
          index: index,
          final: false
        })
        index++
        bufferAvailable = size
      }

      toCopy = Math.min(bufferAvailable, chunkAvailable)
      chunk.copy(buffer, size - bufferAvailable, chunk.length - chunkAvailable, chunk.length - chunkAvailable + toCopy)

      bufferAvailable -= toCopy
      chunkAvailable -= toCopy
    }

    done()
  }

  stream._flush = (done) => {
    if (bufferAvailable !== size) {
      stream.push({
        // -0 is 0 which is the start of the slice, but what we meant is the end
        // of the slice, so we need to pass in undefined instead for that.
        data: Buffer.from(buffer.slice(0, -bufferAvailable || undefined)),
        index: index,
        final: true
      })
      bufferAvailable = size
    }
    done()
  }

  return stream
}
