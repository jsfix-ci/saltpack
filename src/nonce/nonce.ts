// All the indexed nonces work in the same way, by prepending some hardcoded
// bytes to a u64 big-endian index as bytes.
export const indexed = (prefix: Uint8Array, index:number):Uint8Array => {
 // > the nonce saltpack_recipsbXXXXXXXX. XXXXXXXX is 8-byte big-endian unsigned
 // > recipient index, where the first recipient is index zero
 //
 // As a pragmatic consideration in JavaScript we don't have native u64 values
 // to work with. The closest is the big int type which is only about a year old
 // at the time of writing so we can't rely on it for reliable in-browser usage.
 // MessagePack only supports 2^32 recipients anyway so currently there is no
 // possible way to make use of the full u64 bytes allowed by an 8-byte nonce.
 // Therefore, we can get away with a Buffer.writeUInt32BE call to get a nice,
 // native(ish)/polyfill solution. By the time the spec progresses to the point
 // that we need a full u64 nonce, big int will be well and truly established.
 let be = Buffer.allocUnsafe(4)
 be.writeUInt32BE(index)
 return Uint8Array.from([...prefix, ...[0, 0, 0, 0], ...Uint8Array.from(be)])
}
