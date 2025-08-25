/* eslint-env node */

'use strict';

/**
 * @file Agoric-specific plugin
 * @author Agoric
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require('requireindex');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const packageJson = require('../package.json');

const plugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version,
  },
  configs: {},
  environments: {},
  rules: requireIndex(`${__dirname}/rules`),
  processors: requireIndex(`${__dirname}/processors`),
};

module.exports = plugin;

const { recommended, ...rest } = requireIndex(`${__dirname}/configs`);
const configMakers = { recommended, ...rest };
for (const [name, configMaker] of Object.entries(configMakers)) {
  plugin.configs[`flat/${name}`] = configMaker(plugin);
  plugin.configs[name] = configMaker();
}
