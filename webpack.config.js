const makeConfig = require("react-noscripts/webpack.config");
const fs = require("fs");

module.exports = function (env) {
  let config = makeConfig({
    ...env,
    library: true,
  });

  return config;
};
