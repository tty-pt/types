const makeConfig = require("@tty-pt/scripts/webpack.config");

module.exports = function (env) {
  let config = makeConfig({
    ...env,
    development: true,
    library: true,
  });

  return config;
};
