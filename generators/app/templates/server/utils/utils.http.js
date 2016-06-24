'use strict'

import _ from 'lodash';
import Promise from 'bluebird';
import request from 'request';
import chalk from 'chalk';

import config from '../config';
import _logger from './utils.logger';

function log(msg) {
  _logger.stream.write(msg);
}

/**
 * Makes a *method* request to the provided *url* with a body of *content*
 * and returns a promise of the response body.
 *
 * @parma {String} method The method of which to make the request.
 * @param {String} url Url to make the GET requests to
 * @param {Object} content The conent of the body
 * @param {Object} options Defaults to {}, options object to use in the GET request
 * @param {Boolean} assumeJson Defaults to true
 * @return {Promise} -> {Any}
 */
const _request = (method, url, data, options = {}, assumeJson = true) => new Promise((resolve, reject) => {

  // Don't send anything to clickatell for now
  if (!config.sms.allow_sending && /clickatell/i.test(url)) {
    log(`Would've sent a request to ${chalk.green(url)}\nWith the following content:\n${JSON.stringify(data, null, 4)}\nWith the following headers:\n${JSON.stringify(options.headers, null, 4)}`);

    return resolve();
  }

  // Create the request object
  let _requestOptions = _.assign({}, options, {
    method: method.toLowerCase(),
    uri: url,
    body: data,
    json: true,
    encoding: options.encoding || null,
    headers: _.assign({}, {
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
      }, options.headers)
  });

  request(_requestOptions, (err, res, body) => {
    // Reject if an error occurred.
    if (err) return reject(err);

    // Handle errors via statuses.
    if (400 <= res.statusCode && res.statusCode <= 500) {

      return reject(new Error('Something went wrong with the request, status code: ' + res.statusCode + ', ' + res.statusMessage));
    }

    resolve(body || res.body);
  });
});

/**
 * Makes a GET request to the provided *url*
 * and returns a promise of the response body.
 *
 * If data is an object, it will be converted into query params
 * and be appended to *url*.
 *
 * @param {String} url Url to make the GET requests to
 * @param {Object|String} data Will be used as query params if defined.
 * @param {Object} options Defaults to {}, options object to use in the GET request
 * @param {Boolean} assumeJson Defaults to true
 * @return {Promise} -> {Any}
 */
export const _get = (url, data, options = {}, assumeJson = true) => {
  let _params;
  let _url = url;

  // Handle data
  if (_.isString(data)) {
    // data is a string and is assumed to be url encoded
    _params = data;
  } else if (_.isObject(data)) {
    // Data is an object which sould be converted into query params
    _params = _.map(data, (value, key) => encodeURI([key, value].join('='))).join('&');
  }

  // Append *_params* if defined
  if (!_.isUndefined(_params)) {
    // Join either by ? or & depending on whether there already is a ? in the url
    _url += (/\?/.test(url) ? '&' : '?') + _params;
  }

  return _request('get', _url, undefined, options, assumeJson);
}

/**
 * Makes a PUT request to the provided *url* with the body of *contents*
 * and returns a promise of the response body.
 *
 * @param {String} url Url to make the GET requests to
 * @param {Object} content The conent of the body
 * @param {Object} options Defaults to {}, options object to use in the GET request
 * @param {Boolean} assumeJson Defaults to true
 * @return {Promise} -> {Any}
 */
export const _put = (url, data, options = {}, assumeJson = true) => _request('put', url, data, options, assumeJson);

/**
 * Makes a POST request to the provided *url* with the body of *contents*
 * and returns a promise of the response body.
 *
 * @param {String} url Url to make the GET requests to
 * @param {Object} content The conent of the body
 * @param {Object} options Defaults to {}, options object to use in the GET request
 * @param {Boolean} assumeJson Defaults to true
 * @return {Promise} -> {Any}
 */
export const _post = (url, data, options = {}, assumeJson = true) => _request('post', url, data, options, assumeJson);

/**
 * Makes a DELETE request to the provided *url*
 * and returns a promise of the response body.
 *
 * If data is an object, it will be converted into query params
 * and be appended to *url*.
 *
 * @param {String} url Url to make the DELETE requests to
 * @param {Object|String} data Will be used as query params if defined.
 * @param {Object} options Defaults to {}, options object to use in the GET request
 * @param {Boolean} assumeJson Defaults to true
 * @return {Promise} -> {Any}
 */
export const _delete = (url, data, options = {}, assumeJson = true) => {
  let _params;
  let _url = url;

  // Handle data
  if (_.isString(data)) {
    // data is a string and is assumed to be url encoded
    _params = data;
  } else if (_.isObject(data)) {
    // Data is an object which sould be converted into query params
    _params = _.map(data, (value, key) => encodeURI([key, value].join('='))).join('&');
  }

  // Append *_params* if defined
  if (!_.isUndefined(_params)) {
    // Join either by ? or & depending on whether there already is a ? in the url
    _url += (/\?/.test(url) ? '&' : '?') + _params;
  }

  return _request('delete', _url, undefined, options, assumeJson);
}

export default {
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
}
