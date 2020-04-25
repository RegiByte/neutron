const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const fs = require('fs-extra');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  { // TODO: replace this custom plugin for some official way of dealing with the native_modules folder generation
    apply(compiler) {
      compiler.hooks.afterEmit.tap('Copy Native Modules', (compilation) => {
        fs.copySync(__dirname + '/.webpack/renderer/native_modules', __dirname + '/.webpack/native_modules');
      });
    },
  },
];
