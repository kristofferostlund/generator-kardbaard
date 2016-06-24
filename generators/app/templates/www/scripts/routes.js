'use strict'

import Vue from 'vue';
import VueRouter from 'vue-router';

// Use the router
Vue.use(VueRouter);

import auth from './services/auth';
import components from './components/components';

/**
 * Vue Router uses an empty (or not...) components
 * as base rather than the a new Vue instance.
 */
const App = Vue.extend({});

const router = new VueRouter({
  hashbang: false,
});

router.map({
  '/': {
    name: 'main',
    component: components.mainRoute,
  },
  '/login': {
    name: 'login',
    component: components.loginRoute,
  },
});

// Ensure routes which require auth is only accessible when authenticated
router.beforeEach((transition) => {
  if (auth.isLoggedIn() && transition.to.name === 'login') {
    transition.redirect('home');
  } else if (!auth.isLoggedIn() && transition.to.name !== 'login') {
    transition.redirect('login');
  } else {
    transition.next();
  }
});

router.redirect({
  '*': '/',
});

router.start(App, '#app-mount');

export default router;
