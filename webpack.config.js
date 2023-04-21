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
    'three'
  ],
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module'
    }
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