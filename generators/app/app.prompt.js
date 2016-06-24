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
function promptAppName(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'name',
      message: 'What\'s the projet name?',
      description: 'The name will be converted into snake-case if not already in that format',
      // Defaults to current folder name
      default: _this.answers.name || _.snakeCase(_this.appname),
    }, function (answers) {
      // Name must be snake case
      if (answers.name) { answers.name = _.snakeCase(answers.name); }

      // Resolve _this extended with *answers*
      resolve(utils.assignDeep(_this, 'answers', answers));
    });
  });
}

/**
 * Returns a promise of _this where _this.answers also has an author attribute.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {_this}
 */
function promptAuthor(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'author',
      message: 'What\'s the name of the author?',
      // Defaults to current folder name
      default: _this.answers.author || 'Arthur Dent',
    }, function (answers) {
      // Resolve _this extended with *answers*
      resolve(utils.assignDeep(_this, 'answers', answers));
    });
  });
}

/**
 * Returns a promise of _this where _this.answers also has a description attribute.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {_this}
 */
function promptDescription(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'description',
      message: 'What\'s the projet about?',
      // Defaults to current folder name
      default: _this.answers.description || 'A project generated using the kardbaard generator.',
    }, function (answers) {
      // Resolve _this extended with *answers*
      resolve(utils.assignDeep(_this, 'answers', answers));
    });
  });
}

/**
 * Prompts the user for the git repo and cleans the resulting.
 *
 * @param {Object} yo - yo instance, from generators.(Named)Base.extend used as *this*
 * @return {Promise} -> *yo* - to be chainable
 */
function promptGitUrl(_this) {
  return new Promise(function (resolve, reject) {

    _this.prompt({
      type: 'input',
      name: 'git',
      message: 'Where\'s the Git repo located?'
    }, function (answers) {
      if (answers.git) { answers.git = utils.normalizeGit(answers.git); }

      resolve(utils.assignDeep(_this, 'answers', answers));
    });
  });
};

/**
 * Returns a promise of _this where _this.answers also has a description attribute.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {_this}
 */
function promptLicense(_this) {
  return new Promise(function (resolve, reject) {
    _this.prompt({
      type: 'input',
      name: 'license',
      message: 'What license is the project under?',
      // Defaults to current folder name
      default: _this.answers.license || 'ISC',
    }, function (answers) {
      // Resolve _this extended with *answers*
      resolve(utils.assignDeep(_this, 'answers', answers));
    });
  });
}

/**
 * Returns a promise of the answers from all questions.
 *
 * Questions which will be asked:
 * - App name
 * - Author
 * - Description
 * - Git URL
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @return {Promise} -> {Object}
 */
module.exports = function (_this) {
  return new Promise(function (resolve, reject) {
    promptAppName(_this)
    .then(promptAuthor)
    .then(promptDescription)
    .then(promptGitUrl)
    .then(promptLicense)
    .then(function (__this) { resolve(__this.answers); })
    .catch(reject);
  });
}
