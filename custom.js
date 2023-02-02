const jp = require('jsonpath')
const lodash = require('lodash')
const opts = {
  maxChunkSize: 2500,
  targetKey: 'body',
}
const data = require("./s")
const chunks = jp.paths(data, "$..body").reverse()

const nestedPathmap = chunks.reduce((acc, chunk) => {
  const pathExpr = jp.stringify(chunk);
  // get the value at the path
  const value = jp.value(data, pathExpr);
  // if(pathExpr !== "$.body") {
  //   lodash.set(data, pathExpr.replace("$.", ""), pathExpr)
  //   console.log(data)
  // }
  // create object with no values but same keys as value

  acc[pathExpr] = jp.value(data, pathExpr);

  const empty = Object.keys(value).reduce((acc, key) => {
    if(Array.isArray(value)) {
      acc[key] = value[key]
      // Object.keys(acc[key]).forEach((child) => {
      //   acc[key][child] = null
      // });
      return acc
    }
    return acc;
  },Array.isArray(value) ? value : {});
  const parent = jp.parent(data, pathExpr);
  parent.body = Array.isArray(value) ? empty : {_keys:Object.keys(value), _expression: pathExpr};

  // console.log(jp.query(require("./s"), chunk.pop()))
  return acc
},{})
nestedPathmap['$'] = data

const keymap = Object.entries(nestedPathmap).reverse().reduce((acc, [key, value]) => {
  acc += key + '|||' + JSON.stringify(value) + '\n'
  return acc
},'')

require('fs').writeFileSync('./keymap.txt', keymap)
// console.log(keymap)
// console.log(data)


