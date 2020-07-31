
const test = require('ava')
const three = require('three')
const projector = require('./')

test('RenderableObject', t => {
  t.falsy(three.RenderableObject)
  projector(three)
  t.truthy(three.RenderableObject)
})
