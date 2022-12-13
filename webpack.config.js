const makeConfig = require("react-noscripts/webpack.config");
const fs = require("fs");

module.exports = function (env) {
  let config = makeConfig({
    ...env,
    library: true,
  });

  config.plugins.push(new (class {
    apply(compiler) {
      compiler.hooks.done.tap('Cleanup', () => {
        fs.unlinkSync('build/main.js.LICENSE.txt');
      });
    }
  })());

  console.log(Object.keys(require("./package.json").peerDependencies).reduce((a, key) => ({ ...a, [key]: key }), {}), config.externals);
  return config;
};
