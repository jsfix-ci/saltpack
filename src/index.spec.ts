import { addTwo } from './index'
import 'mocha'
import { strict as assert } from 'assert'

describe('addTwo', () => {
 const result = addTwo(2)
 assert.equal(result, 4)
})
