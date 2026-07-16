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

plugin.configs = {};

// Importing this plugin must NOT eagerly evaluate any config: some configs
// (notably `internal`) call `FlatCompat.extends('plugin:@endo/strict', ...)` at
// construction time. This pulls in `@endo/eslint-plugin`'s legacy config whose
// transitively-referenced plugins (e.g., `eslint-plugin-jsdoc`) are resolved
// relative to *this* package's directory. We have no guarantee that any given
// transitive dep is resolvable from here!
// Lazy eval sidesteps this entirely for flat-config consumers.
for (const [name, configMaker] of Object.entries(configMakers)) {
  let legacyConfig;
  let flatConfig;
  Object.defineProperty(plugin.configs, name, {
    enumerable: true,
    get: () => {
      legacyConfig ??= configMaker();
      return legacyConfig;
    },
  });
  Object.defineProperty(plugin.configs, `flat/${name}`, {
    enumerable: true,
    get: () => {
      flatConfig ??= configMaker(plugin);
      return flatConfig;
    },
  });
}
