'use strict'

import Vue from 'vue';
import _ from 'lodash';
import Promise from 'bluebird';

import template from './login-route.template.html';

import auth from '../../services/auth';

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
        auth.validateEmail(this.email),
        // Passwqord must exist
        !!this.password,
      ]);
    },
  },
});

Vue.component('login-route', LoginRouteComponent);

export default LoginRouteComponent;
