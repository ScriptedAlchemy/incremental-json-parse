const Benchmark = require('benchmark');
const swc = require('@swc/core')
const babel = require('@babel/parser')

const os = require('os')
const fs = require('fs');
const numThreads = (os.cpus().length) / 2
const SOURCE = fs.readFileSync('.pnp.cjs', 'utf8')
const comp = JSON.parse(fs.readFileSync('c.json', 'utf8'))
const keymap = fs.readFileSync('keymap.txt', 'utf8');
const simdjson = require("simdjson")
const iparse = require("incremental-json-parser")
const fast = require("fast-json")
const lodash = require('lodash')
var suite = new Benchmark.Suite;
const flat = require('flat')
const plj = require('parse-large-json')
var setup;
// add tests
const K = JSON.stringify(comp.K)
const P = JSON.stringify(comp.P)
const _ = JSON.stringify(comp._)


const pointers = keymap.split('\n').reduce((acc, line) => {
  let spl = line.split('|||')
  acc[spl[0]] = spl[1]
  return acc
}, {});

let jsonString = '{"name": "John", "age": 30}';
let obj = JSON.parse(jsonString, function (key, value) {
  let storedValue = value;
  if (key === 'age') {
    Object.defineProperty(this, key, {
      get: function () {
        return storedValue + ' years';
      },
      configurable: true
    });
  }
  return this[key];
});
console.log(obj.age, obj.agereal);

const modifyGetters = (ptr, path) => {


  if(typeof ptr[path] !== "string") {
   if(ptr[path])
    return ptr[path]
  }

  const chunk = JSON.parse(ptr[path], function (key, value) {

    if (key === 'body') {
      // console.log("body",Array.isArray(value), value, ref);
      // console.log([path,"body"].join('.'))
      const ob = {}

      if (Array.isArray(value)) {
        return value.map((item, i) => {
          for (const [key, value] of Object.entries(item)) {
            Object.defineProperty(item, key, {
                get: function () {
                  // console.log("getter",[path,"body"].join('.'),modifyGetters(ptr, [path,"body"].join('.')))
                  return modifyGetters(ptr, [path, "body"].join('.'))[i][key]
                }
              }
            )
          }
          return item

        })
      } else {
        value._keys.reduce((acc, key) => {
          value[key] = {}
          Object.defineProperty(value, key, {
            get: function () {
              // console.log("getter",[path,"body"].join('.'),modifyGetters(ptr, [path,"body"].join('.')))
              return modifyGetters(ptr, value._expression)[key]
            }
          })
          return acc
        }, value)
        delete value._keys
        // delete value._expression
        return value
      }
    }
    return value

    // return value;
  });
  ptr[path] = chunk
  // const pointer = chunk.body;

  // return chunk

//     if (key === 'body') {
//       return new Proxy({}, {
//         get: function (target, prop) {
// console.log('proxy', 'hot');
//           console.log(target, prop)
//           // return modifyGetters(pointers, pointer);
//         }
//       })
//     }
//     return value
//   })
  return chunk
}


// console.log(pointers['$'])
const main = modifyGetters(pointers, '$')
// console.log(JSON.parse(pointers['$.body']))
// console.log('body here 1', main.body[1].declarations);
// console.log('body here 2',    main.body[2].body.stmts);
// console.log('body here 3', main.body[3].expression.callee);

// console.log(main.body[2].body.stmts[0].argument.arguments)
// console.log(main.body[2].body.stmts)
// JSON.parse(JSON.stringify(main.body[2].body))
// console.log(JSON.parse(pointers['$.body[2].body']))


// const pointerBody = modifyGetters(pointers,'$')
// console.log(pointerBody.body)
swc.parse(SOURCE).then((mainast) => {
  console.log("boot")
// const m = JSON.parse(mainast).body
//   const body = m.map(JSON.stringify)
//   const body2 = JSON.stringify(m)
  suite.add('keymap', {
    defer: true,
    fn: async function (deferred) {
      await swc.parse(SOURCE).then(() => {

        // const pointerBody = JSON.parse(pointers['$'])
        // const originalPointer = pointerBody.body
        // Object.defineProperty(pointerBody, 'body', {
        //   get() {
        //     const value = JSON.parse(pointers[originalPointer])
        //     this.body = value
        //     return value
        //   },
        // })
        let c = 0
        const ptrs = keymap.split('\n').reduce((acc, line) => {
          let spl = line.split('|||')
          // try {
          // JSON.parse(spl[1]);
          //   } catch (e) {
          //   console.error('err',spl[1])
          // }
          c++
          // if(typeof spl[1] === "string") {
          //   if(c < 3) {
          //     acc[spl[0]] = JSON.parse(spl[1])
          //     return acc
          //   }
          //   setTimeout(() => {
          //     acc[spl[0]] = JSON.parse(spl[1])
          //   }, 0)
          // }
          acc[spl[0]] = spl[1]

          return acc
        }, {});
        const prtbody = modifyGetters(ptrs, '$')
        // const dff = prtbody.body[1].declarations
        // const e = prtbody.body[2].body.stmts
        // const t = prtbody.body[3].expression.callee
        // const te= prtbody.body[2].body
        // console.log(dff)
      })
      deferred.resolve()
    }
  })


    remote.init(__webpack_share_scopes)



    //     .add('JSON parse pointer', {
    //       defer: true,
    //       fn: async function (deferred) {
    //         const ast = await swc.parse(SOURCE)
    // JSON.parse(ast)
    // // simdjson.lazyParse(K)
    // // simdjson.lazyParse(P)
    // // simdjson.lazyParse(_)
    // // flat.unflatten(flt)
    //         // JSON.parse(body2)
    //         deferred.resolve()
    //       }
    //     })
    .add('JSON parse', {
      defer: true,
      fn: async function (deferred) {
        const ast = await swc.parse(SOURCE)
        JSON.parse(ast)
        deferred.resolve()
      }
    })
    // .add('swc parse fast-json', {
    //   defer: true,
    //   fn: async function (deferred) {
    //     const ast = swc.parseSync(SOURCE)
    //
    //     deferred.resolve()
    //   }
    // })
    // .add('swc parse simdjson', {
    //   defer: true,
    //   fn: async function (deferred) {
    //
    //     const ast = swc.parseSync(SOURCE)
    //     deferred.resolve()
    //   }
    // })
    // .add('swc parse simdjson lazy', {
    //   defer: true,
    //   fn: async function (deferred) {
    //
    //     const ast = swc.parseSync(SOURCE)
    //     deferred.resolve()
    //   }
    // })
    .add('swc no parse', {
      defer: true,
      fn: async function (deferred) {

        const ast = await swc.parse(SOURCE);
        deferred.resolve()
      }
    })
    // .add('swc parse', {
    //   defer: true,
    //   fn: async function (deferred) {
    //
    //     const ast = swc.parseSync(SOURCE);
    //
    //     deferred.resolve()
    //   }
    // })
    .add('babel parse', function () {
      babel.parse(SOURCE)
    })
    .add(`swc parse simdjson (x${numThreads})`, {
      defer: true,
      fn: function (deferred) {
        Promise.all(
          Array.from({length: numThreads}).map(() => {
            const ast = swc.parse(SOURCE)
            return ast
          }),
        ).then(() => {
          deferred.resolve()
        })
          .catch((e) => {
            console.error(e)
          })
      }
    })
    .add(`keymap parse (x${numThreads})`, {
      defer: true,
      fn: function (deferred) {
        Promise.all(
          Array.from({length: numThreads}).map(() => {
            return swc.parse(SOURCE).then(() => {
              const pointers = keymap.split('\n').reduce((acc, line) => {
                let spl = line.split('|||')
                acc[spl[0]] = spl[1]
                return acc
              }, {});
              const prtbody = modifyGetters(pointers, '$')
              // const dff = prtbody.body[1].declarations
              // const e = prtbody.body[2].body.stmts
              // const t = prtbody.body[3].expression.callee
            })
          }),
        ).then(() => {
          deferred.resolve()
        })
          .catch((e) => {
            console.error(e)
          })
      }
    })
    .add(`swc parse (x${numThreads})`, {
      defer: true,
      fn: function (deferred) {
        Promise.all(
          Array.from({length: numThreads}).map(() => {
            return swc.parse(SOURCE).then(JSON.parse)
          }),
        )
          .then(() => {
            deferred.resolve()
          })
          .catch((e) => {
            console.error(e)
          })
      }
    })
    .add(`swc no parse (x${numThreads})`, {
      defer: true,
      fn: function (deferred) {
        Promise.all(
          Array.from({length: numThreads}).map(() => {
            const ast = swc.parse(SOURCE)

            return ast
          }),
        )
          .then(() => {
            deferred.resolve()
          })
          .catch((e) => {
            console.error(e)
          })
      }
    })
    .add(`babel parse (x${numThreads})`, function () {
      for (let i = 0; i < numThreads; i++) {
        babel.parse(SOURCE)
      }
    })
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({'async': true});
})
