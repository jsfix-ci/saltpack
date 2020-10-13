export class FormatName {
 private value: FormatName.Value
 constructor(value:FormatName.Value) {
  this.value = value
 }

 encode():FormatName.Encoded {
  return this.value
 }
}

export namespace FormatName {
 export type Encoded = string
 export enum Value {
  SaltPack = "saltpack"
 }

 export function decode(encoded:Encoded):FormatName|Error {
  if ( encoded === Value.SaltPack ) {
   return new FormatName(Value.SaltPack)
  }
  return Error(FormatName.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}
