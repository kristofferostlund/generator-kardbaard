'use strict'

import _ from 'lodash';
import compose from 'composable-middleware';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from '../../api/user/user.db';
import config from '../../config';
import utils from '../../utils/utils';

/**
 * Finds the token from either query params, headers or cookies
 * and return it token.
 *
 * If 'Bearer ' isn't part it of the token, it's added.
 *
 * @param {Object} req Express request object
 * @param {Boolean} tokenOnly Should only the the token be returned? Defaults to falsy
 * @return {String}
 */
const findToken = (req, tokenOnly) => {
  // Find the token from any of these sources
  let _appToken = _.find([
    _.get(req, 'query.token'),
    _.get(req, 'query.access_token'),
    _.get(req, 'headers.token'),
    _.get(req, 'headers.authorization'),
    _.get(req, 'headers.Authorization'),
    _.get(req, 'cookies.token'),
    _.get(req, 'cookies.access_token'),
    _.get(req, 'cookies.authorization'),
    _.get(req, 'cookies.Authorization'),
  ], (token) => !!token);

  // Add Bearer if none exists
  if (!tokenOnly && _appToken && !/^Bearer /.test(_appToken)) {
    _appToken = 'Bearer ' + _appToken;
  } else if (tokenOnly && /^Bearer /.test(_appToken)) {
    _appToken = _appToken.split(' ')[1];
  }

  // Return it
  return _appToken;
}

/**
 * Signs a token and returns it.
 *
 * @param {Data} data Data to sign into the token
 * @return {String} token
 */
export const signToken = (data) => {
  return jwt.sign(data, config.app_secret, { expiresIn: 60 * 60 * 24 * 365 });
}

/**
 * Decodes a token and returns the result.
 *
 * @param {Object} req Express request object
 * @return {String} token
 */
export const decodeToken = (req) => {
  // Get the token
  let _token = _.isString(req)
    ? req
    : findToken(req);

  // Return the decoded token.
  return jwt.decode(_token, config.app_secret);
}

/**
 * Middlewhare for ensuring authentication.
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
export const isAuthenticated = (req, res, next) => {
  let _token;

  return compose().use(function (req, res, next) {
    // Find the token
    _token = findToken(req, true);

    // Get the decoded data
    let _decoded = decodeToken(_token);

    let _userId = !!_decoded ? _decoded.userId : null;

    // If no userId was found, return a response of 401, Unauthorized.
    if (_userId === null) {
      return res.status(401).send('Unauthorized');
    }

    // // Find the user and attach it to the response object
    return User.findById(_userId)
    .then((user) => {
      // Add the user to the response
      req.user = user;

      // If there is no registered user, return a 401 unauthorized
      if (!_userId || !req.user.userId) {
        return res.status(401).send('Unauthorized');
      }

      next();
    })
    .catch((err) => {
      return utils.handleError(res, err);
    });
  });
}

/**
 * Returns a GUID string.
 *
 * Example output: '1a729180f8-1f9c3-18d86-13b26-15ff6120931f241'
 *
 * @return {String} GUID string
 */
export const guid = () => {
  return _.times(5, (i) => {
    // Assign n to 2 if i === 0, 3 if i === 4, otherwise 1
    let n = [2, 1, 1, 1, 3][i];

    return _.times(n, () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring()).join('');
  }).join('-');
}

/**
 * Returns an encrypted password.
 *
 * @param {String} plainPassword The password to encrypt
 * @return {String}
 */
export const encryptPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(10));
}

/**
 * Returns true or false for whether the *plainPassword* is valid against *hashedPassword*.
 *
 * @param {String} hashedPassword The hashed password to compare against
 * @param {String} plainPassword The plain password to compare against *hashedPassword*
 * @return {Boolean}
 */
export const validatePassword = (hashedPassword, plainPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export default {
  signToken: signToken,
  decodeToken: decodeToken,
  isAuthenticated: isAuthenticated,
  guid: guid,
  encryptPassword: encryptPassword,
  validatePassword: validatePassword,
}
