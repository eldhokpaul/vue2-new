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
    let computed = []
    const computedProps = {}
    let jsParsed = false
    let templateParsed = false

    const processAndReport = (context) => {
      const functionsNotCalled = _.difference(Object.keys(computedProps), computed)
      functionsNotCalled.forEach((fn) => {
        context.report({
          node: computedProps[fn],
          message: `The computed property ${fn} is defined but never used, either use or remove it.`
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
      Identifier (node) {
        computed.push(node.name)
      }
    },
    {
      Property (node) {
        // If a state is watched it is used
        if (
          node.key.name === 'computed' &&
          node.value.type === 'ObjectExpression'
        ) {
          node
            .value
            .properties
            .filter(({ type }) => type === 'Property')
            .reduce((acc, n) => {
              acc[n.key.name] = n
              return acc
            }, computedProps)
        } else if (node.key.name === 'watch') {
          const computedPropsUsed = node.value.properties.map(({ key }) => key.name)
          computed = [...computed, ...computedPropsUsed]
        }
      },
      MemberExpression (node) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier'
        ) {
          computed.push(node.property.name)
        }
      },
      'Program:exit': function () {
        jsParsed = true
        processAndReport(context)
      }
    })
  }
}
