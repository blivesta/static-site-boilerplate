import config, { envProduction } from './config'
import path from 'path'
import webpack from 'webpack'

const webpackConfig = {
  entry: {
    app: [
      'babel-polyfill',
      path.join(__dirname, `${config.dirs.src}/js/app.js`)
    ],
    foo: [
      path.join(__dirname, `${config.dirs.src}/js/foo.js`)
    ]
  },
  output: {
    path: path.join(__dirname, `${config.dirs.dest}/js`),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'standard-loader',
        enforce: 'pre',
        exclude: /node_modules/
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      IScroll: 'iscroll'
    })
  ],
  externals: {
    jquery: 'window.jQuery'
  }
}

if (envProduction) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  )
} else {
  webpackConfig.devtool = 'source-map'
}

export default webpackConfig
