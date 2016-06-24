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
function promptServiceName(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'name',
      message: 'What\'s the service called?',
      description: 'The name will be converted into camelCase if not already in that format',
      default: utils.camelCase(_this.name) || 'routeName',
    }, function (answers) {
      // Name must be camelCase
      if (answers.name) { answers.name = utils.camelCase(answers.name); }

      // Resolve _this extended with *serviceAnswers*
      resolve(utils.assignDeep(_this, 'serviceAnswers', answers));
    })
  });
}

/**
 * Returns a promise of the answers from all questions.
 *
 * Questions which will be asked:
 * - Service name
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {Object}
 */
module.exports = function (_this) {
  return new Promise(function (resolve, reject) {
    promptServiceName(_this)
    .then(function (__this) { resolve(__this.serviceAnswers) })
    .catch(reject);
  });
}
