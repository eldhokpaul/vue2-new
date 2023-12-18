const gaEnabled = ['1', 'true'].includes(process.env.VUE_APP_GA_ENABLED)
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].gaEnabled = gaEnabled
        return args
      })
    config.optimization
      .minimizer('terser')
      .tap(args => {
        const { terserOptions } = args[0]
        terserOptions.keep_classnames = true
        terserOptions.keep_fnames = true
        return args
      })
  },
  configureWebpack: {
    devServer: {
      allowedHosts: 'all'
    },
    module: {
      rules: [
        {
          test: /\.(pdf|doc?x)(\?.*)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: 'files/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    }
  },
  transpileDependencies: ['vuetify']
})
