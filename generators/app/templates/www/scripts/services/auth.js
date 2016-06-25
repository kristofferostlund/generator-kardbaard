'use strict'

import Promise from 'bluebird';
import {attempt, isError, assign} from 'lodash';
import Vue from 'vue';

import utils from './utils';
import config from '../config';

const { http, storage } = utils;

/**
 * regex for validating email addresses.
 */
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Keep a global reference to the local user
let _currentUser;

/**
 * Returns the token stored as token in localstorage.
 *
 * @return {String}
 */
export function getToken() {
  return storage.get('token');
}

/**
 * Returns true or false for whether the user is logged in or not.
 *
 * @return {Boolean}
 */
export function isLoggedIn() {
  // If there is a token, assume the user is logged in
  return !!getToken();
}

/**
 * @param {String} username The username of the user
 * @param {String} password The password of the user
 * @return {Promise} -> {Object}
 */
export function login(email, password) {
  return new Promise((resolve, reject) => {
    http.put('/services/auth/login', { email: email, password: password })
    .then((resp) => {
      _currentUser = resp.data;
      storage.set('currentUser', _currentUser);

      storage.set('token', resp.token);
      resolve(_currentUser);
    })
    .catch(reject);
  });
}

/**
 * Removes the auth token and resets the current user.
 */
export function logout() {
  storage.set('token', null);
  storage.set('currentUser', null);
  // Reload the page
  location.reload();
}

/**
 * Returns a promise of the currently logged in user
 * by requesting the server.
 *
 * @return {Promise} -> {Object}
 */
export function getMe() {
  return new Promise((resolve, reject) => {
    http.get(`/api/users/${getCurrentUser().userId}`)
    .then((user) => {
      // Update the current user
      _currentUser = user;
      // Store to localStorage
      storage.set('currentUser', _currentUser);
      // Resolve the current user
      resolve(_currentUser);
    })
    .catch(reject);
  });
}

/**
 * Returns the current user
 *
 * @return {Object}
 */
export function getCurrentUser() {
  return _currentUser;
}

/**
 * Gets the necessary headers for making authenticated requests
 * to the server.
 *
 * @param {String} token
 * @param {Object} headers
 * @return {Object}
 */
export function getHeaders(token, headers) {
  let _token = !!token ? token : getToken();
  return assign({}, headers, {
    'Authorization': `Bearer ${_token}`,
  });
}

/**
 * Validates an email address.
 *
 * @param {String} email Email address to validate
 * @return {Boolean}
 */
export function validateEmail(email) {
  return emailRegex.test(email);
}

/**
 * Sets up the auth module.
 */
function setup() {
  _currentUser = storage.get('currentUser');

  if (isLoggedIn()) {
    getMe()
    .then((data) => {
      console.log('User is all set up!');
    })
    .catch((err => console.log(err)))
  }
}

// Call the setup method to initialize all things auth.
setup();

console.log('Attached logout function to window for use when developing');
window.logout = logout;

export default {
  getToken: getToken,
  isLoggedIn: isLoggedIn,
  login: login,
  logout: logout,
  getMe: getMe,
  getCurrentUser: getCurrentUser,
  getHeaders: getHeaders,
  validateEmail: validateEmail,
}