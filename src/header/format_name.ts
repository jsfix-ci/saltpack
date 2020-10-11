import { parse as mpParse } from '../messagepack/parse'

export type Value = string

// > The format name is the string "saltpack".
export enum FormatName {
 SaltPack = "saltpack"
}

export function value(formatName:FormatName):Value {
 return FormatName.SaltPack
}

export function parse(value:Value):FormatName|Error {
 return mpParse(
  (value:Value) => { return value === FormatName.SaltPack },
  (value:Value) => { return FormatName.SaltPack },
  value,
  'FormatName',
 )
}
