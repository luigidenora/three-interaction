const path = require('path');
const CopyPkgJsonPlugin = require("copy-pkg-json-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  experiments: {
    outputModule: true
  },
  externals: [
    'three',
    'three/examples/jsm/libs/stats.module',
    'three/examples/jsm/lines/LineMaterial',
    'three/examples/jsm/lines/Line2',
    'three/examples/jsm/lines/LineGeometry'
  ],
  module: {
    rules: [
      {
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    library: {
      type: 'module'
    },
    clean: true
  },
  plugins: [
    new CopyPkgJsonPlugin({
      remove: ['devDependencies', 'scripts']
    }),
    new CopyPlugin({
      patterns: [
        { from: "README.md", to: "README.md" },
      ]
    })
  ]
};