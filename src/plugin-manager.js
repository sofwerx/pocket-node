var ConfigFileManager = require('./config-file-manager'),
    fileManager = new ConfigFileManager('plugins.json'),
    npm = require('npm-programmatic');

// Returns the plugin data object
module.exports.getPluginData = async function(network) {
  var pluginData = fileManager.getProperty(network.toUpperCase());
  if(!pluginData) throw 'Plugin not found for network: ' + network;
  return pluginData;
}

// Returns the actual plugin module
module.exports.getPlugin = async function(network) {
  var pluginData = await this.getPluginData(network.toUpperCase()),
      plugin = null;
  if (pluginData) {
    plugin = require(pluginData['package_name']);
  }
  return plugin;
}

// Returns wheter or not a plugin for this network exists
module.exports.pluginInstalled = function(network) {
  return fileManager.propertyExists(network.toUpperCase());
}

// Registers a plugin
module.exports.registerPlugin = function(packageName, errorCb) {
  npm
    .install(packageName, {
      cwd:'.',
      save:true
    })
    .then(function() {
      var plugin = require(packageName),
          pluginDefinition = plugin.getPluginDefinition();
      pluginDefinition['configuration'] = {};
      fileManager.updateProperty(pluginDefinition.network, pluginDefinition);
      console.log(packageName + ' plugin installed succesfully');
    })
    .catch(errorCb);
}

// Removes a plugin
module.exports.removePlugin = function(network, errorCb) {
  var pluginData = this.getPluginData(network);
  npm
    .uninstall(pluginData['package_name'])
    .then(function() {
      fileManager.deleteProperty(pluginData['network']);
      console.log(pluginData['package_name'] + ' plugin deleted succesfully');
    })
    .catch(errorCb);
}

// Return all plugins (with their configurations)
module.exports.listPlugins = function() {
  return Object.values(fileManager.getConfigFile());
}

// Setup configuration object for plugin
module.exports.configurePlugin = function(network, configuration) {
  var pluginData = this.getPluginData(network);

  // Avoid plugin definition overwrites
  delete configuration['network'];
  delete configuration['version'];
  delete configuration['package_name'];

  // Update configuration
  pluginData['configuration'] = configuration;
  fileManager.updateProperty(network, pluginData);
  console.log('Configuration set for plugin: ' + pluginData['package_name'] + ' with network: ' + pluginData['network']);
}

module.exports.getSupportedNetworks = function() {
  return Object.keys(fileManager.getConfigFile());
}

module.exports.isNetworkSupported = function(network) {
  return Object.keys(fileManager.getConfigFile()).includes(network.toUpperCase());
}
