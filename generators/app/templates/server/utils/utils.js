'use strict'

import _ from 'lodash';
import DataObjectParser from 'dataobject-parser';
import sql from 'seriate';
import mssql from 'mssql';
import path from 'path';

import _http from './utils.http';
import _logger from './utils.logger';
import _sql from './utils.sql';

import config from '../config';

export const http = _http;
export const logger = _logger;

/**
 * Logs something via the logging tool.
 *
 * @param {Any} message
 */
export const log = (message) => _logger.stream.write(message);

/**
 * Logs something as an error via the logging tool.
 *
 * @param {Any} message
 */
export const error = (message) => _logger.stream.writeError(message);

/**
 * Calls sends a response to the user of 500: Internal Error
 * and logs the actual error.
 *
 * @param {Object} res Express response object
 * @param {Error} err The error
 */
export const handleError = (res, err) => {
  log(err);
  if ((err || {}).stack) {
    log('\n');
    log(err.stack);
  }
  res.status(500).send('Internal error');
}


/**
 * Escapes characters which need escaping in a RegExp.
 * This allows for passing in any string into a RegExp constructor
 * and have it seen as literal
 *
 * @param {String} text
 * @return {String}
 */
export const escapeRegex = (text) => {
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
export const literalRegExp = (text, flags) => {
  return new RegExp(escapeRegex(text), flags);
}

/**
 * Returns a new object where property names
 * with dots are converted into nested objects and arrays.
 *
 * Example: { 'prop.sub': 'value' } -> { prop: { sub: value } }
 *
 * @param {Array|Object} sqlArray
 * @return {Array|Object}
 */
export const objectify = (sqlArray) => {
  // Ensure it's an array
  let _isObj;
  if (!_.isArray(sqlArray)) {
    sqlArray = [ sqlArray ];
    _isObj = true;
  }

  let _arr = _.map(sqlArray, (sqlObj) => {
    let _data = new DataObjectParser();

    // Get all values
    _.map(sqlObj, (value, key) => {
      _data.set(key, value);
    });

    return _data.data();
  });

  return _isObj ? _.first(_arr) : _arr;
}

/**
 * Returns the first *propName* from *collection*.
 *
 * @param {ArrayLike} collection The collection to get from
 * @param {String} propName The name of the property to get the first of
 * @param {String} orders The way to order, defaults to 'asc'
 * @return {Any}
 */
export const headBy = (collection, propName, orders = 'asc') => {
  return _.chain(collection)
    .orderBy(propName, orders)
    .thru(_.head)
    .get(propName)
    .value();
}

/**
 * @param {Any} message The message to print
 * @param {Number} verticalPadding Vertical padding as number of '\n', if 0 then none.
 * @param {Boolean} asIs Should *message* be printed as is? Defaults to false
 */
export const print = (message, verticalPadding = 0, asIs = false) => {
  if (!!verticalPadding) { log(_.times(verticalPadding, () => '\n').join('')); }
  if (_.some([
    _.isError(message),
    _.isString(message),
    _.isNumber(message),
    _.isUndefined(message),
  ])) { asIs = true; }
  log(
    !!asIs ? message : JSON.stringify(message, null, 4)
  );
  if (!!verticalPadding) { log(_.times(verticalPadding, () => '\n').join('')); }
}

/**
 * Replaces the item at *index* in *coll*.
 *
 * @param {ArrayLike} coll Collection to replace item in
 * @param {Number|String} index Index to replace at. Could also
 * @param {Any} value Value to use instead
 */
export function replace(coll, index, value) {
  // Get a clone of the collection
  let _coll = _.clone(coll);
  // Set the item at *index* to value.
  _coll[index] = value;

  // Return the new item
  return _coll;
}

export default {
  http: _http,
  logger: _logger,
  sql: _sql,
  log: log,
  error: error,
  escapeRegex: escapeRegex,
  literalRegExp: literalRegExp,
  objectify: objectify,
  headBy: headBy,
  print: print,
  replace: replace,
}
