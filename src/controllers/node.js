var PluginManager = require('../plugin-manager'),
    packageData = require('../../package.json');

module.exports.index = async function(ctx, next) {
  ctx.body = {
    version: packageData.version,
    networks: PluginManager.getSupportedNetworks()
  };
  await next();
};
