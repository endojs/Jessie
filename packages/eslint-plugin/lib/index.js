/* global __dirname module require */
/**
 * @file Agoric-specific plugin
 * @author Agoric
 */

'use strict';

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
