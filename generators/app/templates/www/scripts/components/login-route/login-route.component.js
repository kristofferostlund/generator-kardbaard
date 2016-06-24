'use strict'

import Vue from 'vue';
import _ from 'lodash';
import Promise from 'bluebird';

import template from './login-route.template.html';

import auth from '../../services/auth';

/**
 * regex for validating email addresses.
 */
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const LoginRouteComponent = Vue.extend({
  template,
  data: function () {
    return {
      email: '',
      password: '',
      isLoading: false
    };
  },
  props: {
  },
  methods: {
    login: function () {
      this.isLoading = true;
      const { email, password } = this;

      if (!this.allowLogin()) {
        // We cannot login yet.
        return;
      }

      auth.login(email, password)
      .then(user => {
        this.isLoading = false;
        this.$router.go('/');
      })
      .catch(err => {
        this.isLoading = false;
      });
    },
    allowLogin: function () {
      return _.every([
        // Email must be valid
        emailRegex.test(this.email),
        // Passwqord must exist
        !!this.password,
      ]);
    },
  },
});

Vue.component('login-route', LoginRouteComponent);

export default LoginRouteComponent;
