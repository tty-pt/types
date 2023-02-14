const makeConfig = require("@tty-pt/scripts/webpack.config");
const path = require("path");

module.exports = function (env) {
  let config = makeConfig({
    ...env,
    development: true,
    library: true,
  });

  // const appDir = "/home/quirinpa/movai/src/feapps/frontend-npm-fleetmanager";
  // config.externalsType = "umd";
  // config.resolve.alias["@tty-pt/styles"] = path.resolve(appDir + "/node_modules/@tty-pt/styles");
  // config.resolve.alias["react"] = path.resolve(appDir + "/node_modules/react");
  // config.resolve.alias["react-dom"] = path.resolve(appDir + "/node_modules/react-dom");
  // config.resolve.alias["@material-ui/styles"] = path.resolve(appDir + "/node_modules/@material-ui/styles");
  return config;
};
