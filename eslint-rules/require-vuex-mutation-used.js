'use strict'
const { defineTemplateBodyVisitor } = require('eslint-plugin-vue/lib/utils/index.js')
const _ = require('lodash')

module.exports = {
  meta: {
    docs: {
      description: 'Requires that any mutation mapped from the vuex store is used',
      category: 'Possible Errors',
      recommended: true
    }
  },
  create: function (context) {
    const mutationsUsed = []
    const mutations = {}
    let jsParsed = false
    let templateParsed = false

    const handleCallExpression = (node) => {
      if (node.callee.type === 'Identifier') {
        mutationsUsed.push(node.callee.name)
      } else if (node.callee.type === 'MemberExpression') {
        mutationsUsed.push(node.callee.property.name)
      }
    }

    const processAndReport = (context) => {
      const functionsNotCalled = _.difference(Object.keys(mutations), mutationsUsed)
      functionsNotCalled.forEach((fn) => {
        context.report({
          node: mutations[fn],
          message: `The mutation ${fn} is defined but never used, either use or remove it.`
        })
      })
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
          mutationsUsed.push(node.expression.name)
        }
      }
    },
    {
      CallExpression (node) {
        if (node.callee.name === 'mapMutations') {
          if (node.arguments.length === 1) {
            node.arguments[0].elements.reduce((acc, { value }) => {
              acc[value] = node
              return acc
            }, mutations)
          } else if (node.arguments.length === 2) {
            node.arguments[1].elements.reduce((acc, { value }) => {
              acc[value] = node
              return acc
            }, mutations)
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
