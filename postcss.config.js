const postcssConfig = {
  plugins: [
    require('stylelint'),
    require('postcss-import'),
    require('postcss-custom-properties')({
      // preserve: true,
    }),
    require('postcss-custom-media'),
    require('postcss-nesting'),
    require('postcss-apply'),
    require('postcss-calc'),
    require('postcss-color-function'),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer'),
    require('postcss-browser-reporter')({ selector: 'body:before' }),
    require('postcss-reporter')({ clearMessages: true })
  ]
}

const beforeReporter = postcssConfig.plugins.length - 2

if (process.env.NODE_ENV === 'production') {
  // minify
  const csswring = require('csswring')
  postcssConfig.plugins.splice(beforeReporter, 0, csswring)
} else {
  // style guide
  const styleGuide = require('postcss-style-guide')
  postcssConfig.plugins.splice(beforeReporter, 0, styleGuide({
    theme: 'minimal'
  }))
}

module.exports = postcssConfig
