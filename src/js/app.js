import { WP_PARAMETERS } from './constants'

const obj = {
  foo: 'red',
  bar: 'black'
}

const extend = Object.assign(obj, {
  foo: 'blue'
})

Object.keys(obj).forEach(function (key) {
  console.log(key)
})

console.log(extend)
console.log(WP_PARAMETERS)
console.log($(window).width())
