'use strict'

var _ = require('lodash');
var ngu = require('normalize-git-url');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

/**
 * Normalizes the git URL
 * Accepts both HTTPS and SSH urls.
 * Returns an ngu object extended with the rawUrl.
 *
 * @param {String} gitUrl
 * @return {Object} { url: {String}, branch: {String}, rawUrl: {String} }
 */
function normalizeGit(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    // Return the an empty object as an ngu like.
    return { url: '', branch: '', rawUrl: rawUrl };
  }

  var git = ngu(rawUrl);

  // Clean the url
  git.url = git.url
    .replace(/\.git$/, '') // Remove trailing '.git'
    .replace(/^[a-z]+@|^https:\/\/[a-z]+@/gi, 'https://') // Replace possible git@ or https://username@ with https://
    .replace(/(\.[a-z]+):/, '$1/'); // Replace ':' in the middle with '/', sort of

  return _.extend({}, git, { rawUrl: rawUrl });
};

/**
 * Coverts spaces and other non-letters or numbers to PascalCase.
 *
 * @param {String} input
 * @return {String}
 */
function pascalCase(input) {
  return !input
    ? ''
    : _.map(input.split(/[^a-öA-Ö0-9]/), function (subStr) {
      return subStr[0].toUpperCase() + subStr.slice(1);
    }).join('');
}

/**
 * Coverts spaces and other non-letters or numbers to CamelCase.
 *
 * @param {String} input
 * @return {String}
 */
function camelCase(input) {
  var pascal = pascalCase(input);
  return !input
    ? ''
    : pascal[0].toLowerCase() + pascal.slice(1);
}

/**
 * Escapes characters which need escaping in a RegExp.
 * This allows for passing in any string into a RegExp constructor
 * and have it seen as literal
 *
 * @param {String} text
 * @return {String}
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s\/]/g, "\\$&");
};

/**
 * Returns an escaped RegExp object as the literal string *text*.
 * Flags are optional, but can be provided.
 *
 * @param {String} text
 * @param {String} flags - optional
 * @return {Object} - RegExp object
 */
function literalRegExp(text, flags) {
  return new RegExp(escapeRegex(text), flags);
}

/**
 * Injects *content* into the file at *destination*
 * between /// Start injection /// and /// Stop injection ///
 * if *content* isn't already present.
 *
 * @param {Object} yo - yo instance, from generators.(Named)Base.extend used as *this*
 * @param {String} content - text to inject
 * @param {String} destination - filepath, defaults to yo.destinationPath('server/api/routes.js')
 * @param {RegExp} regex The regex to match
 */
function injectText(_this, content, destination, regex) {
  var fileContents;

  destination = destination
    ? destination
    : _this.destinationPath('server/api/routes.js');

  // Get the file contents.
  try {
    fileContents = fs.readFileSync(destination, 'utf8');
  } catch (error) {
    _this.log(
      '\n' +
      chalk.yellow('Could not find the file at ' + destination + ',\ncould not inject ') +
      chalk.bgYellow(content) +
      '\n'
    );
    // Return early
    return;
  }

  // Check if the injection already exists
  if (literalRegExp(content, 'g').test(fileContents)) {
    // It's already there, no need to do anything.
    return;
  }

  // Create regex to match between */// Start injection ///* and */// Stop injection ///*
  var _regex = !!regex
    ? regex
    : /(\/\/\/\sStart\sinjection\s\/\/\/)([\s\S]*)(?=\/\/\/\sStop\sinjection\s\/\/\/)/i;

  // '$1' is the injection start, '$2' is all content after between injection start and stop
  var _replace = ['$1$2', content, '\n'].join('');

  // Get that small space before the match for consistent intendation.
  var _contentRegex = new RegExp(['(.*)', escapeRegex(content)].join(''));
  var _preContentSpace = (fileContents.replace(_regex, _replace).match(_contentRegex) || [])[1] || '';

  _replace = ['$1$2', content, '\n', _preContentSpace].join('');

  // Update the file.
  fs.writeFileSync(destination, fileContents.replace(_regex, _replace));
}

/**
 * @param {String} start Literal start string to match
 * @param {String} stop Literal stop string to match
 * @param {String} flags The regex flags
 * @return {RegExp}
 */
function injectRegex(start, stop, flags) {
  return new RegExp([
    '({start})'.replace('{start}', escapeRegex(start)),
    '([\\s\\S]*)',
    '(?={stop})'.replace('{stop}', escapeRegex(stop)),
  ].join(''), flags);
}

/**
 * Assigns the _value at _path of _base to themselves plus whatever is in _value
 * and returns _base.
 *
 * Similar to _.assign
 *
 * NOTE: This will mutate _base, as its prototypes must be usable.
 *
 * @param {Object} _base The base object to mutate
 * @param {String} _path The path in dotnotation
 * @param {Object|Any} _value The value to assign at _path
 * @return {Object}
 */
function assignDeep(_base, _path, _value) {
  // The value to use to assign
  var _data = _.set({}, _path, _.assign({}, _.get(_base, _path), _value));

  return _.assign(_base, _data);
}

/**
 * Combines and returns an url-like string by joining the params together.
 *
 * *basePath* is joined by the others by '/'.
 * All files except 'index.js' or when *skipName* is true
 * will be joined with *routeName*, so the filename will be *routeName*.*fileName*.
 *
 * Example return:
 *    'server/api/customer/customer.dbHandler.js'
 * or 'server/api/customer/index.js'
 *
 * @param {String} basePath
 * @param {String} typeName
 * @param {String} filename
 * @param {Boolean} skipName
 * @return {String} -> path-like string
 */
function createPathName(basePath, typeName, filename, skipName) {
  var _filename = /api\/services/i.test(basePath)
    ? typeName
    : _.filter([(filename === 'index.js' || skipName ? '' : typeName), filename]).join('.');

  return _.filter([basePath, _filename]).join('/');
};

/**
 * Copies the template file and populates it with template data.
 * *originalPath* is split by '/',
 * and the all but the last element in that list is joined to 'server/api' as the relative path.
 * fileName is assumed to be the last element of split *originalPath*.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @param {String} basePath The bae path to go before _this.name
 * @param {String} originPath The path to the template file
 * @param {Object} options Template origin for the fs.copyTpl function
 */
function copyTemplate(_this, basePath, originPath, options) {
  // Split the separate path segments into an array
  var _originPath = originPath.split('/')
  // Get the filename
  var _filename = _originPath.pop();
  // Create the new path
  var _path = [basePath, _this.name].concat(_originPath).join('/');
  // Create the actual file path
  var _filepath = createPathName(_path, _this.name, _filename);
  // Copy the template
  _this.fs.copyTpl(
    _this.templatePath(originPath),
    _this.destinationPath(_filepath),
    options
  );
}

/**
 * Recursively copies over all templates
 * and appends the name of the route to each file name.
 *
 * @param {Object} _this The yo object which often is used as this.[something]
 * @param {String} basePath The path to where files should go.
 * @param {Object} options Template options for the fs.copyTpl function
 * @param {String} subFolder Optional, the folder name of the folder below templates
 */
function copyTemplateFiles(_this, basePath, options, subFolder) {
  // Get the template path
  var _templatePath = !!subFolder ? _this.templatePath(subFolder) : _this.templatePath();
  // Iterate over all files in the folder _templatePath
  fs.readdirSync(_templatePath).forEach(function (pathName) {
    // Get the folder path to a subfolder
    var _subFolder = _.filter([subFolder, pathName]).join('/');
    // Is it a file?
    var _statObj = fs.statSync([_templatePath, pathName].join('/'));
    if (_statObj.isFile()) {
      // If it's a file, copy the template using the options
      copyTemplate(_this, basePath, _subFolder, options);
    } else if (_statObj.isDirectory()) {
      // Need to go deeper
      return copyTemplateFiles(_this, basePath, options, _subFolder);
    }
  });
}

module.exports = {
  normalizeGit: normalizeGit,
  pascalCase: pascalCase,
  camelCase: camelCase,
  escapeRegex: escapeRegex,
  literalRegExp: literalRegExp,
  injectText: injectText,
  injectRegex: injectRegex,
  assignDeep: assignDeep,
  copyTemplateFiles: copyTemplateFiles,
}
