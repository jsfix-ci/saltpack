import { parse as mpParse } from '../messagepack/parse'

export type Value = Uint8Array

export interface SenderSecretBox {
 secretBox: Value
}

export function value(senderSecretBox:SenderSecretBox):Value {
 return senderSecretBox.secretBox
}

export function parse(value:Value):SenderSecretBox|Error {
 return mpParse(
  (value:Value) => { return value.constructor === Buffer },
  (value:Value) => { return { secretBox: Uint8Array.from(value) } },
  value,
  'SenderSecretBox',
 )
}
