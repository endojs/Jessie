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

module.exports.configs = requireIndex(`${__dirname}/configs`);
module.exports.processors = requireIndex(`${__dirname}/processors`);
module.exports.rules = requireIndex(`${__dirname}/rules`);
