import { parse as mpParse } from '../messagepack/parse'

// > The version is a list of the major and minor versions, currently [2, 0], both encoded as positive fixnums.
export enum Version {
 One,
 Two,
}

export type Value = [ number, number ]

const one: Value = [ 1, 0 ]
const two: Value = [ 2, 0 ]

export function value(version:Version):Value {
 switch (version) {
  case Version.One: return one
  case Version.Two: return two
 }
}

export function parse(value:Value):Version|Error {
 return mpParse(
  (value:Value) => {
   let [ major, minor ] = value
   return ( major === 1 || major === 2 ) && minor === 0
  },
  (value:Value) => {
   let [ major, minor ] = value
   // currently there are no minor versions
   if ( minor === 0 ) {
    switch(major) {
     case 1: return Version.One
     case 2: return Version.Two
    }
   }
  },
  value,
  'Version',
 )
}
