'use strict'

import _ from 'lodash';
import mssql, { Connection } from 'mssql';
import config from './../config';
import sql from 'seriate';

import _logger from './utils.logger';

// Connection to db
const __connection = {
  context: new Connection(config.db),
  conn: undefined,
  lastError: undefined,
};

/**
 * Logs to stream
 *
 * @param {String} msg
 */
function log(msg) {
  _logger.stream.write(msg);
}

/**
 * Logs an error to stream
 *
 * @param {String} msg
 */
function error(msg) {
  _logger.stream.writeError(msg);
}

/**
 * Listens for the closed event and sets __connection.conn to undefined.
 */
__connection.context.on('close', () => {
  __connection.conn = undefined;
});

__connection.context.on('error', (err) => {
  log(`The following error occured with the SQL connection:\n${err}`);

  if (__connection.context.connected) {
    log('Closing the SQL connection for now.')
    __connection.context.close();
  }
});

/***************
 * Exports below
 ***************/

/**
 * Keeps a local
 *
 * @param {String} connectionName Name of the connection to get.
 * @return {Object} Connection
 */
export function getConnection() {
  if (__connection.context.connected) {
    // There is already a connection.
    return Promise.resolve(__connection.conn);
  }

  // Create a new Connection
  return new Promise((resolve, reject) => {
    log('Connceting to the SQL server.');

    __connection.context.connect()
    .then(connection => {
      log('Successfully connected to the SQL server.');
      // Set the stored connection
      __connection.conn = connection;
      // Resolve it
      resolve(__connection.conn);
    })
    .catch(err => {
      log('An error occured when connecting to the SQL server.');
      reject(err);
    });
  });
}


/**
 * Returns an array of SQL like objects from the default *.initialize.sql file contents.
 *
 * @param {String} fileContents The contents of the SQL file to parse
 * @param {Array} skipNames Array of all columns to skip by name, defaults to []
 * @param {Boolean} skipIdentity Boolean for whether the identity column should be skipped, defaults to true
 * @param {Object} __sql Should be either *mssql* or *sql* (seriate), from which the type system will be used. Defaults to *mssql*
 * @return {Array}
 */
export const parseInitTable = (fileContents, skipNames = [], skipIdentity = true, __sql = mssql) => {
  let _output = _.attempt(() => {
    return fileContents
      // Match everything inside the create table statement
      .match(/(CREATE TABLE.*\()([\S\s]*)(?=\)\s)/i)[2]
      // Split on every comma where there is a square bracket following it or some whitespace (ex: , [...)
      .split(/\,\s*(?=\[)/)
      // Remove all extra whitespace
      .map((line) => line.replace(/\s{2,}/g, ''))
      // Remove line comments
      .map((line) => line.replace(/\s*\-\-.*/, ''))
      // Filter out identity column if skipIdentity is true
      .filter((line) => !!skipIdentity ? !/identity\(/i.test(line) : true)
      // Get the names, type, nullability and default value
      .map((line) => {
        return {
          name: line.match(/\[(.+)\]/)[1],
          nullable: !/not null/i.test(line),
          type: (() => {
            let _typeVal = (line.match(/\]\s*([^\s]+)\s*/)[1] || '').toUpperCase();

            let _inBrackets = (line.match(/\((.*)\)/) || [])[1];

            // Only numbers or MAX is allowed
            if (!!_inBrackets && !/^([0-9]+|max)$/i.test(_inBrackets)) {
              _inBrackets = undefined;
            }

            // Check for max values inside brackets (ex: VarChar(MAX))
            const _isMax = /max/i.test(_inBrackets);

            _typeVal = _.isUndefined(_inBrackets)
                ? _typeVal
                : _typeVal.replace(/\(.*/, '');

            // Get the param, if any
            const _param = _isMax ? __sql.MAX : Number(_inBrackets);

            // Assign the sql type
            const _sqlType = !_inBrackets
              ? _.get(__sql, _typeVal)
              : _.get(__sql, _typeVal)(_param);

            // Return the sql type
            return _sqlType;
          })(),
          default: (line.match(/default\s(.*)\s/i) || [])[1]
        }
      })
      // Filter out any columns which are in the skipNames array
      .filter((line) => !_.find(skipNames, (name = '') => name.toLowerCase() === (line.name || '').toLowerCase()));
  });

  return !_.isError(_output)
    ? _output
    : [];
}

/**
 * Drops the table at *tableName* in the default database.
 * If *database* is defined, it is used instead.
 *
 * @param {String} tableName Name of the table to drop
 * @param {String} database Name of the database to use, optional
 * @return {Promise} -> {undefined}
 */
export const dropTable = (tableName, database) => new Promise ((resolve, reject) => {
  // Ensure there are wrapping square brackets
  const _tableName = /^\[.*\]$/.test(tableName)
    ? `[dbo].${tableName}`
    : `[dbo].[${tableName}]`;

  // If there's a database, make sure it's in square brackets
  const _database = (!!database && /^\[.*\]$/.test(database))
    ? database
    : `[${database}]`;

  // Use either the default database or *database*
  const _tablePath = !!database
    ? `${_database}.${_tableName}`
    : _tableName;

  // Create the query
  const _query = `DROP TABLE ${_tablePath}`;

  log(`Dropping table ${_tablePath}`);

  // Drop the table!
  sql.execute({
    query: _query
  })
  .then(resolve)
  .catch(reject);
});

/**
 * @param {Array} collection The items to create many of
 * @param {String} tableName Name of the table to insert *collection* into
 * @param {String} dirname The __dirname variable for setting the root for files
 * @param {String} baseName Base of name for the sql files
 * @param {String} mainId Name of the main id column in the table. Defaults to *baseName* + 'Id'
 * @param {Array} skipNames Array of column names to skip in creating the table. Identity columns will be skipped. Defaults to ['isDisabled', 'dateUpdated', 'dateCreated']
 * @return {Promise} -> {Array}
 */
export const createMany = (collection, tableName, dirname, baseName, mainId, skipNames = ['isDisabled', 'dateUpdated', 'dateCreated']) => new Promise((resolve, reject) => {
  // Ensure mainId is defined
  if (!mainId) { mainId = `${baseName}Id`; }

  // Use with output
  const _isArray = _.isArray(collection);

  // Allow either objects or arrays.
  const _collection = _isArray
    ? collection
    : [collection];

  if (!_collection || !_collection.length) {
    return resolve([]);
  }

  // Create the temp table
  const _table = new mssql.Table(tableName);

  // Get the column definitions for the table, execpt for the IDS
  const _columns = parseInitTable(sql.fromFile(path.resolve(dirname, `./sql/${baseName}.initialize.sql`)), skipNames);

  // Set table creation to true, to ensure the table is created if it doesn't exist,
  // which it shouldn't do
  _table.create = true;

  // Add all columns to the table
  _.forEach(_columns, (col, i) => {
    _table.columns.add(col.name, col.type, _.omit(col, ['name', 'type']));
  });

  // Add all rows
  _.forEach(_collection, (item) => {
    // Get all parameters from the items in the order of the column names
    const _data = _.map(_columns, (col) => {
      // Get shorthand for the value
      const _value = item[col.name];

      // If any of these are true, a null value should be returned
      const _criteria = [
          (_value || '').toString() === 'NaN',
          _value === 'NaN',
          _.isUndefined(_value),
          /Int/.test(col.type.type || col.type) && isNaN(_value)
        ];

      // Tedious doesn't seem to like undefined values when parsing Integers
      if (_.some(_criteria)) {
        // The value is eitehr NaN or undefined,
        // which is better handled as null
        return null;
      } else if (/Int/.test(col.type.type || col.type)) {
        return parseInt(_value);
      } else {
        return _value;
      }
    });

    // Add the row
    _table.rows.add(..._data);
  });

  // Create a request instace and make the bulk operation
  return getConnection()
    .then((connection) => {
    // Get the current request
    const _request = new mssql.Request(connection);

    return _request.bulk(_table);
  })
  .then((rowCount) => {

    // Query the DB and return the latest inserts
    return sql.execute({
      query: sql.fromFile(path.resolve(dirname, `./sql/${baseName}.find.sql`))
        .replace('SELECT', `SELECT TOP ${rowCount}`)
        + `ORDER BY [${mainId}] DESC`
    });
  })
  // Objectify, reverse and resolve the data
  .then((items) => resolve(_isArray ? objectify(items).reverse() : objectify(items[0])))
  .catch(reject);
});

/**
 * Returns a params object based on model and item.
 *
 * @param {{}[]} model Array of types from parseInitTable(...)
 * @param {String[]} nonParams Array of names to filter out
 * @param {Object} item Item to pick values from
 * @return {Object}
 */
export function getParams(model = [], nonParams = [], item = {}) {
  return _.reduce(
    _.filter(model, (type) => !~nonParams.indexOf(type.name)),
    (obj, {type, name}) => _.assign({}, obj, _.set({}, name, { type: type, val: item[name] })),
    {}
  );
}

export default {
  getConnection: getConnection,
  parseInitTable: parseInitTable,
  dropTable: dropTable,
  createMany: createMany,
  getParams: getParams,
}