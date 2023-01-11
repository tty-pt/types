const makeConfig = require("react-noscripts/webpack.config");

module.exports = function (env) {
  let config = makeConfig({
    ...env,
    library: true,
  });

  return config;
};
