import { unpack as unpackLib, pack as packLib} from 'msgpackr';

export type Value = Uint8Array

export type Encoded = Uint8Array

const decoder: D.Decoder<unknown, Value> = pipe(
 Uint8ArrayDecoder
)

const encoder: E.Encoder<Encoded, Value>

export function pack(value:any):ArrayBuffer {
 return packLib(value)
}

export function unpack(buf:ArrayBuffer):any {
 return unpackLib(Buffer.from(buf))
}
