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
    let methodsUsed = []
    const methods = {}
    let jsParsed = false
    let templateParsed = false

    const handleCallExpression = (node) => {
      if (node.callee.type === 'Identifier') {
        methodsUsed.push(node.callee.name)
      } else if (node.callee.type === 'MemberExpression') {
        methodsUsed.push(node.callee.property.name)
      }
    }

    const processAndReport = (context) => {
      const functionsNotCalled = _.difference(Object.keys(methods), methodsUsed)
      functionsNotCalled.forEach((fn) => {
        context.report({
          node: methods[fn],
          message: `The method property ${fn} is defined but never used, either use or remove it.`
        })
      })
    }

    return defineTemplateBodyVisitor(context, {
      // Same as program:exit but for template
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
          methodsUsed.push(node.expression.name)
        }
      }
    },
    {
      CallExpression: handleCallExpression,
      Property (node) {
        // If a state is watched it is used
        if (
          node.key.name === 'methods' &&
          node.value.type === 'ObjectExpression'
        ) {
          node
            .value
            .properties
            .filter(({ type }) => type === 'Property')
            .reduce((acc, n) => {
              acc[n.key.name] = n
              return acc
            }, methods)
        } else if (node.key.name === 'watch') {
          const computedPropsUsed = node.value.properties.map(({ key }) => key.name)
          methodsUsed = [...methodsUsed, ...computedPropsUsed]
        }
      },
      MemberExpression (node) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier'
        ) {
          methodsUsed.push(node.property.name)
        }
      },
      'Program:exit': function () {
        jsParsed = true
        processAndReport(context)
      }
    })
  }
}
