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
function promptComponentName(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'name',
      message: 'What\'s the component called?',
      description: 'The name will be converted into PascalCase if not already in that format',
      default: utils.pascalCase(_this.name) || 'ComponentName',
    }, function (answers) {
      // Name must be pascalCase
      if (answers.name) { answers.name = utils.pascalCase(answers.name); }

      // Resolve _this extended with *componentAnswers*
      resolve(utils.assignDeep(_this, 'componentAnswers', answers));
    })
  });
}

/**
 * Returns a promise of the answers from all questions.
 *
 * Questions which will be asked:
 * - Component name
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {Object}
 */
module.exports = function (_this) {
  return new Promise(function (resolve, reject) {
    promptComponentName(_this)
    .then(function (__this) { resolve(__this.componentAnswers) })
    .catch(reject);
  });
}
