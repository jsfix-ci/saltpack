import * as Stream from 'readable-stream'

// Nice references for stream implementations:
// https://codereview.stackexchange.com/questions/57492/chunkertransformstream-a-transform-stream-to-take-arbitrary-chunk-sizes-and-mak
// https://github.com/Olegas/node-chunking-streams
// https://github.com/nodejs/readable-stream

// Chunk output interface.
// Saltpack needs more than just the raw binary data of each chunk for the
// pairwise authenticators and corrupt termination protection.
export interface Chunk {
 // Raw binary data of the chunk.
 data: Buffer,
 // The index of this chunk.
 index: number,
 // Whether this is the final chunk.
 final: boolean
}

export const stream = (size:number) => {
  // Transform stream to implement and return.
  const stream = new Stream.Transform({ objectMode: true })
  // Buffer to put chunks into until we hit `size` bytes.
  const buffer = Buffer.alloc(size)
  // Remaining space in the buffer.
  // Factoring this in terms of what is available rather than the offset makes
  // all the logic simpler (except the chunk.copy() line).
  let bufferAvailable = size
  // Index of the current chunk.
  let index = 0

  stream._transform = (chunk:Buffer, encoding, done) => {
    // Focusing on the remaining chunk data rather than the offset makes all the
    // logic simpler overall even if it's not the immediately obvious approach.
    let chunkAvailable = chunk.length

    // Number of bytes to copy per loop.
    let toCopy
    // Loop through all the available chunk data.
    while (chunkAvailable) {
      // The buffer is full, push and reset it.
      if (!bufferAvailable) {
        // Here we ignore backpressure because chunks are expected to be much
        // smaller than the buffer size so a single chunk cannot thrash many
        // buffer pushes.
        stream.push({
          data: Buffer.from(buffer),
          index: index,
          final: false
        })
        index++
        // The whole buffer is now available once more.
        bufferAvailable = size
      }

      // We are constrained by _both_ the available buffer space and the remaining
      // data to be copied from this chunk. The tightest constraint takes
      // precedence. Setting constraints like this allows us to avoid several
      // almost identical conditional statements that make the reference
      // implementations above relatively messy.
      toCopy = Math.min(bufferAvailable, chunkAvailable)
      chunk.copy(
        buffer,
        // chunk.copy() does not support the negative offset syntax like slice()
        // so we manually calculate everything backwards from the length.
        size - bufferAvailable,
        chunk.length - chunkAvailable,
        chunk.length - chunkAvailable + toCopy
      )

      // Both the buffer and the chunk availability is reduced by what was just
      // copied from the chunk to the buffer.
      bufferAvailable -= toCopy
      chunkAvailable -= toCopy
    }

    done()
  }

  // The only way for a Transform stream to support detecting the final chunk is
  // to leave data in the buffer and rely on the flush event to finalise it.
  // It is __critical__ that stream.end() is called or the final chunk will
  // never be pushed downstream.
  stream._flush = (done) => {
    if (bufferAvailable !== size) {
      stream.push({
        // -0 is 0 which is the start of the slice, but what we meant is the end
        // of the slice, so we need to pass in undefined instead for that.
        // This is an awkward cast where the negative sign is ignored for zero.
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
