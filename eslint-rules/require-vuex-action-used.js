'use strict'
const { defineTemplateBodyVisitor } = require('eslint-plugin-vue/lib/utils/index.js')
const _ = require('lodash')

module.exports = {
  meta: {
    docs: {
      description: 'Requires that any action mapped from the vuex store is used',
      category: 'Possible Errors',
      recommended: true
    }
  },
  create: function (context) {
    const actionsUsed = []
    const actions = {}
    let jsParsed = false
    let templateParsed = false

    const processAndReport = (context) => {
      const functionsNotCalled = _.difference(Object.keys(actions), actionsUsed)
      functionsNotCalled.forEach((fn) => {
        context.report({
          node: actions[fn],
          message: `The action ${fn} is defined but never used, either use or remove it.`
        })
      })
    }

    const handleCallExpression = (node) => {
      if (node.callee.type === 'Identifier') {
        actionsUsed.push(node.callee.name)
      } else if (node.callee.type === 'MemberExpression') {
        actionsUsed.push(node.callee.property.name)
      }
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
      CallExpression: handleCallExpression,
      // For @click="func"
      VExpressionContainer (node) {
        if (node.expression && node.expression.type === 'Identifier') {
          actionsUsed.push(node.expression.name)
        }
      }
    }, {
      CallExpression (node) {
        if (node.callee.name === 'mapActions') {
          if (node.arguments.length === 1) {
            node.arguments[0].elements.reduce((acc, { value }) => {
              acc[value] = node
              return acc
            }, actions)
          } else if (node.arguments.length === 2) {
            node.arguments[1].elements.reduce((acc, { value }) => {
              acc[value] = node
              return acc
            }, actions)
          }
        } else {
          handleCallExpression(node)
        }
      },
      'Program:exit': function () {
        jsParsed = true
        if (jsParsed && templateParsed) {
          processAndReport(context)
        }
      }
    })
  }
}
