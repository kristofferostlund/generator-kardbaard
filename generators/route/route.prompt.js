'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var utils = require('../utils');

/**
 * Returns a promise of _this where _this.answers also has a name attribute.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {_this}
 */
function promptRouteName(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'name',
      message: 'What\'s the route?',
      description: 'The name will be converted into kebab-case if not already in that format',
      // Defaults to current folder name
      default: _.kebabCase(_this.name) || 'routeName',
    }, function (answers) {
      // Name must be kebabCase
      if (answers.name) { answers.name = _.kebabCase(answers.name); }

      // Resolve _this extended with *routeAnswers*
      resolve(utils.assignDeep(_this, 'routeAnswers', answers));
    });
  });
}

/**
 * Returns a promise of the answers from all questions.
 *
 * Questions which will be asked:
 * - Route name
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {Object}
 */
module.exports = function (_this) {
  return new Promise(function (resolve, reject) {
    promptRouteName(_this)
    .then(function (__this) { resolve(__this.routeAnswers); })
    .catch(reject);
  });
}
