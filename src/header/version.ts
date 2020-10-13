// > The version is a list of the major and minor versions, currently [2, 0],
// > both encoded as positive fixnums.
export class Version {
 private value: Version.Value
 constructor(value:Version.Value) {
  this.value = value
 }

 encode():Version.Encoded {
  switch (this.value) {
   case Version.Value.One: return [ 1, 0 ]
   case Version.Value.Two: return [ 2, 0 ]
  }
 }
}

export namespace Version {
 export type Encoded = [ number, number ]
 export enum Value {
  One,
  Two,
 }

 const one: Encoded = [ 1, 0 ]
 const two: Encoded = [ 2, 0 ]

 export function decode(encoded:Encoded):Version|Error {
  let [ major, minor ] = encoded
  // currently there are no minor versions
  if ( minor === 0 ) {
   switch (major) {
    case 1: return new Version(Value.One)
    case 2: return new Version(Value.Two)
   }
  }
  return Error(Version.name + ' failed to decode ' + JSON.stringify(encoded))
 }
}
