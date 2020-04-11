/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const PROJECT_DIR = path.resolve(__dirname);

const DEVELOPMENT = (process.env.NODE_ENV === "development");

module.exports = {
  mode: (DEVELOPMENT)? 'development' : 'production',
  context: path.resolve(PROJECT_DIR),
  entry: {
    'app': path.resolve(PROJECT_DIR, 'src', 'main.ts')
  },
  output: {
    path: path.resolve(PROJECT_DIR, './dist'),
    filename: 'js/[name].js',
    publicPath: '/',
    chunkFilename: 'js/[name].js'
  },
  target: "web",
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(PROJECT_DIR, 'public', 'index.html'),
      filename: 'index.html'
    }),
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(PROJECT_DIR, 'public'),
          to: path.resolve(PROJECT_DIR, 'dist'),
          toType: 'dir',
          ignore: [
            '.DS_Store',
            {
              glob: 'index.html',
              matchBase: false
            }
          ]
        }
      ]
    ),
    new CleanWebpackPlugin(),

  ],
  module: {
    rules: [{
      test: /\.(s*)css$/,
      use: ['style-loader', 'vue-style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
    },{
      test: /\.vue$/,
      use: ['vue-loader']
    },{
      test: /\.(ts|tsx)?$/,
      use: [{
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      }],
      exclude: /node_modules/,
    },{
      test: /\.(svg)(\?.*)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'img/[name].[hash:8].[ext]'
        }
      }]
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(PROJECT_DIR, 'src')
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true
      }
    },
    hot: true,
    // contentBase: './dist',

  },
  devtool: 'cheap-module-eval-source-map'
}