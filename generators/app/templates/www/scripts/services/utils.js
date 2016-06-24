'use strict'

import _ from 'lodash';
import Promise from 'bluebird';
import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

/**
 * Very thin wrapper for setting and getting cookies.
 */
export const cookie = {
  /**
   * Returns the cookie matching *name*.
   *
   * Returns null if none is found.
   *
   * @param {String} name Name of cooki to get
   * @return {String} Value of cookie
   */
  get: (name) => ((new RegExp(name + '=([^;]+)')).exec(document.cookie) || [])[1] || null,

  /**
   * Sets the cookie at *name* to *value*.
   *
   * @param {String} name Name of the cookie to set
   * @param {String} value  Value of the cookie to set
   * @return {String}
   */
  set: (name, value) => document.cookie = [name, value].join('='),
}

/**
 * Tries to parse value and return it.
 *
 * If value can't be parsed or the parse is empty, value itself is returned.
 *
 * @param {Any} value Value to try to parse
 * @return {Any} Whatever was either parsed or *value* itself
 */
export const jsonParseOrValue = (value) => {
  try {
    return JSON.parse(value) || value;
  } catch (error) {
    return value;
  }
}

export const storage = {
  set: (key, value) => {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }

    return value;
  },
  get: (key) => {
    let _data = localStorage.getItem(key);
    let _parsed = _.attempt(() => JSON.parse(_data));

    return _.isError(_parsed)
      ? _data
      : _parsed;
  }
}

/**
 * Headers should be attached to options.headers
 *
 * @param {String} method The HTTP method to make. Case-insensitive. Defaults to 'GET'.
 * @param {String} url Absolute or relative
 * @param {Object} data Data to pass as the body. Not required.
 * @param {Object} options An options object containing whatever else axajx(...) may use.
 * @param {Boolean} dataOnly Shuold only the data object be returned?
 * @return {Promise} -> {Any}
 */
function _request(method = 'GET', url, data, options = {}, dataOnly) {
  return new Promise((resolve, reject) => {

    const token = storage.get('token') || undefined;
    const defaultHeaders = !!token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const headers = _.assign({}, defaultHeaders, options.headers);

    Vue.http(_.assign({}, options, {
      method: method,
      data: data,
      url: url,
      headers: headers,
    }))
    .then(
      (resp) => resolve(!!dataOnly ? resp.data : resp),
      (err) => reject(new Error(`${err.status}: ${err.statusText}`))
    );
  });
}

/**
 * Complete container object for http methods.
 */
export const http = {
  /**
   * Makes a GET request to *url* and returns a promise of it.
   *
   * @param {String} url Url to make request to
   * @param {Object} options Options object, should probably contain headers
   * @param {Boolean} dataOnly Should only the data object be returned? Defaults to true.
   * @return {Promise} -> {Any}
   */
  get: (url, data, options, dataOnly = true) => {
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

    return _request('GET', _url, null, options, dataOnly);
  },
  /**
   * Makes a POST request to *url* with a body of *data*
   * and returns a promise of it.
   *
   * @param {String} url Url to make request to
   * @param {Object} data JSON serializable data
   * @param {Object} options Options object, should probably contain headers
   * @param {Boolean} dataOnly Should only the data object be returned? Defaults to true.
   * @return {Promise} -> {Any}
   */
  post: (url, data, options, dataOnly = true) => _request('POST', url, data, options, dataOnly),
  /**
   * Makes a PUT request to *url* with a body of *data*
   * and returns a promise of it.
   *
   * @param {String} url Url to make request to
   * @param {Object} data JSON serializable data
   * @param {Object} options Options object, should probably contain headers
   * @param {Boolean} dataOnly Should only the data object be returned? Defaults to true.
   * @return {Promise} -> {Any}
   */
  put: (url, data, options, dataOnly = true) => _request('PUT', url, data, options, dataOnly),
  /**
   * Makes a DELETE request to *url* and returns a promise of it.
   *
   * @param {String} url Url to make request to
   * @param {Object} options Options object, should probably contain headers
   * @param {Boolean} dataOnly Should only the data object be returned? Defaults to true.
   * @return {Promise} -> {Any}
   */
  delete: (url, options, dataOnly = true) => _request('DELETE', url, null, options, dataOnly),
};

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
  cookie: cookie,
  jsonParseOrValue: jsonParseOrValue,
  http: http,
  storage: storage,
  replace: replace,
}
