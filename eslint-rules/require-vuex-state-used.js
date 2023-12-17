'use strict'

const { defineTemplateBodyVisitor } = require('eslint-plugin-vue/lib/utils/index.js')
const _ = require('lodash')

module.exports = {
  meta: {
    docs: {
      description: 'Requires that any state mapped from the vuex store is used',
      category: 'Possible Errors',
      recommended: true
    }
  },
  create: function (context) {
    let statePropsUsed = []
    const state = {}
    let jsParsed = false
    let templateParsed = false

    const processAndReport = (context) => {
      const functionsNotCalled = _.difference(Object.keys(state), statePropsUsed)
      functionsNotCalled.forEach((fn) => {
        context.report({
          node: state[fn],
          message: `The state ${fn} is defined but never used, either use or remove it.`
        })
      })
    }

    const pushPropertiesToState = (elements, node) => {
      elements.reduce((acc, key) => {
        acc[key] = node
        return acc
      }, state)
    }

    return defineTemplateBodyVisitor(context, {
      'VElement:exit' (node) {
        if (node.parent.type === 'VDocumentFragment') {
          templateParsed = true
          if (jsParsed && templateParsed) {
            processAndReport(context)
          }
        }
      },
      Identifier (node) {
        statePropsUsed.push(node.name)
      }
    },
    {
      Property (node) {
        // If a state is watched it is used
        if (node.key.name === 'watch') {
          const stateUsed = node.value.properties.map(({ key }) => key.name)
          statePropsUsed = [...statePropsUsed, ...stateUsed]
        }
      },
      CallExpression (node) {
        if (node.callee.name === 'mapState') {
          if (node.arguments.length === 1) {
            const argument = node.arguments[0]
            if (argument.type === 'ObjectExpression') {
              const elements = argument.properties.map(({ key }) => key.name)
              pushPropertiesToState(elements, node)
            } else {
              const elements = argument.elements.map(({ value }) => value)
              pushPropertiesToState(elements, node)
            }
          } else if (node.arguments.length === 2) {
            const argument = node.arguments[1]
            if (argument.type === 'ObjectExpression') {
              const elements = argument.properties.map(({ key }) => key.name)
              pushPropertiesToState(elements, node)
            } else {
              const elements = argument.elements.map(({ value }) => value)
              pushPropertiesToState(elements, node)
            }
          }
        }
      },
      MemberExpression (node) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier'
        ) {
          statePropsUsed.push(node.property.name)
        }
      },
      'Program:exit': function () {
        jsParsed = true
        processAndReport(context)
      }
    })
  }
}
