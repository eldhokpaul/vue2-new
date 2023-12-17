'use strict'
const fs = require('fs')
const path = require('path')

// Get all rules, strip off .js suffix
const entries = fs.readdirSync('./eslint-rules').map((name) => name.split('.')[0])

module.exports = entries.reduce((acc, rule) => {
  const rulePath = path.join(__dirname, 'eslint-rules', rule)
  acc[rule] = require(rulePath)
  return acc
}, {})
