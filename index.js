var vdom = require('virtual-dom')
var h = require('virtual-dom/h')
var a = require('state-atom')
var vraf = require('virtual-raf')
var extend = require('xtend')

// required for event delegation
// to be handled correctly
require('dom-delegator')()

// setup observable state atom
var atom = a({
  isEditable: a.value(false),
  elements: a.varhash({
    0: Element({
      id: 0,
      tag: "main",
      properties: {
        id: 'the-one-and-only-root'
      },
      children: [1]
    }),
    1: Element({
      id: 1,
      tag: "header",
      properties: {
        className: 'top-of-the-page'
      },
      children: [2]
    }),
    2: Element({
      id: 2,
      tag: "a",
      properties: {
        href: "https://github.com/ahdinosaur",
        textContent: "yoooo!"
      }
    })
  })
})

console.log("initial state", atom())

// get dom tree given initial state
var tree = vraf(atom(), render, vdom)

// add dom tree to body
document.body.appendChild(tree.render())

// update dom tree on state change
atom(function onChange (state) {
  tree.update(state)
})

atom(function onChange (state) {
  console.log("new state", state)
})

/*
 * library
 *
*/

function Element (attrs) {
  // TODO better observable
  return a.value(attrs)
}

function render (state) {
  var root = first(state.elements)

  var renderEl = state.isEditable ?
    renderEditableElement :
    renderElement

  return renderAdminContainer(state, [
    renderEl(root, state.elements)
  ])
}

function renderElement (element, elements) {
  return h(
    element.tag,
    element.properties,
    element.children != null ?
      element.children.map(function (childId) {
        var child = elements[childId]
        return renderElement(child, elements)
      }) :
      null
  )
}

function renderEditableElement (element, elements) {
  return h(
    element.tag,
    extend(element.properties, {
      'ev-click': function (ev) {
        ev.preventDefault()
        console.log('clicked', element.id, 'ev', ev)
      }
    }),
    element.children != null ?
      element.children.map(function (childId) {
        var child = elements[childId]
        return renderElement(child, elements)
      }) :
      null
  )
}

function renderAdminContainer (state, children) {
  return h('div.admin', {}, [
    h('button', {
      textContent: state.isEditable ? 'save' : 'edit',
      'ev-click': function (ev) {
        // TODO should be a barracks action
        atom.isEditable.set(!atom.isEditable())
      }
    })
  ].concat(children))
}

/*
 * utils
 *
*/
function first (obj) {
  return obj[Object.keys(obj)[0]]
}
