'use strict'

import _ from 'lodash';
import env from 'node-env-file';
import path from 'path';
env(path.resolve(__dirname, '../.env'));

/**
 * Replaces dublicate '\\' to a single \\
 *
 * @param {String} str
 * @return {String}
 */
const fixBackslashes = (str) => {
  // If there is no string, return early
  if (_.isUndefined(str) || !_.isString(str)) { return str; }

  return str.replace(/\\{2,}/g,'\\');
}

/**
 * Converts somewhat boolean values and strings such as 'false'.
 *
 * @param {Any} input
 * @return {Boolean}
 */
const parseBool = (input) => {
  if (typeof input === 'undefined') { return undefined; }
  if (typeof input === 'boolean') { return input; }
  if (typeof input === 'string') { return input != 'false'; }

  return !!input;
}

export default {
  port: process.env.PORT || 3000,
  ip: process.env.IP || 'localhost',
  app_secret: process.env.APP_SECRET || 'sssshhhh',
  db: {
    server: fixBackslashes(process.env.DB_SERVER) || 'MSSQL',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_DATABASE || '<%= name %>',
    options: {
      encrypt: !_.isUndefined(process.env.DB_ENCRYPT)
        ? parseBool(process.env.DB_ENCRYPT)
        : true,
      requestTimeout: !_.isUndefined(process.env.DB_REQUEST_TIMEOUT)
        ? process.env.DB_REQUEST_TIMEOUT
        : 60000,
    },
    pool: {
      max: 10,
      min: 1,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_MS) || 30000,
    }
  },
}
