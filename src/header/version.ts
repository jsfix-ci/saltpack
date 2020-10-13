import { parse as mpParse } from '../messagepack/parse'

// > The version is a list of the major and minor versions, currently [2, 0], both encoded as positive fixnums.
export namespace Version {
 const name:string = 'Version'
 export type Portable = [ number, number ]
 export enum Value {
  One,
  Two,
 }

 const one: Portable = [ 1, 0 ]
 const two: Portable = [ 2, 0 ]

 export function toPortable(value:Value):Portable {
  switch (value) {
   case Value.One: return one
   case Value.Two: return two
  }
 }

 function guardPortable(portable:Portable):boolean {
  let [ major, minor ] = portable
  return ( major === 1 || major === 2 ) && ( minor === 0 )
 }

 function fromPortableUnsafe(portable:Portable):Version.Value|void {
  let [ major, minor ] = portable
  // currently there are no minor versions
  if ( minor === 0 ) {
   switch(major) {
    case 1: return Version.Value.One
    case 2: return Version.Value.Two
   }
  }
 }

 export function fromPortable(portable:Portable):Version.Value|Error {
  return mpParse(guardPortable, fromPortableUnsafe, portable, name)
 }
}
