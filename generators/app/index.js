'use strict'

var generators = require('yeoman-generator');
var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');
var shell = require('shelljs');
var fs = require('fs');
var path = require('path');

var utils = require('../utils');
var deps = require('./dependencies');
var prompt = require('./app.prompt');

module.exports = generators.Base.extend({
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // Any options must be declared here
    this.answers = _.extend({}, this.answers, {
      name: !!arguments[0] ? arguments[0][0] : this.appname,
      version: '0.0.0',
      description: ''
    });
  },

  initializing: function () {
    this.log('Initializing...');
  },

  prompting: function () {
    // This function will await user input,
    // and must therefore be async.
    var done = this.async();

    // Prompt the user and assign the answers to this.answers
    prompt(this)
    .then(function (_answers) {
      this.answers = _.assign({}, this.answers, _answers);
      // Call the done callback
      done();
    }.bind(this))
    .catch(function (err) {
      console.log(err);
    });
  },

  configuring: function () {
    // Creates config file.
    this.config.save();
    this.config.set(this.answers);
  },

  writing: function () {
    this.log('Copying file, please wait.')

    this.fs.copyTpl(
      this.templatePath(),
      this.destinationPath(),
      this.answers
    );

    // Iterate over all hidden files
    // as fs.copy won't copy hidden files.
    var _hiddenFiles = fs.readdirSync(this.templatePath());
    _.forEach(_hiddenFiles, function (filename) {
      // Get the statObj for checking if it's a file
      var statObj = fs.statSync(this.templatePath(filename));

      // Return early if it's not a hidden file
      if (!statObj.isFile() || !/^\./.test(filename)) { return; }

      // Copy over hidden files
      this.fs.copyTpl(
        this.templatePath(filename),
        this.destinationPath(filename),
        this.answers
      );

      // Create an .env file as well
      // Cannot be added to repo as it's gitignored
      if (filename === '.env.example') {
        this.fs.copyTpl(
          this.templatePath(filename),
          this.destinationPath('.env'),
          this.answers
        );
      }
    }.bind(this));

  },

  install: function () {
    this.log('\nPlease wait while we\'re installin the dependencies.\nThis might take a while, so go grab a beer or coffee in the mean time!\n');

    this.npmInstall(deps.prod, { 'save': true });
    this.npmInstall(deps.dev, { 'saveDev': true });
  },

  end: function () {
    var missingGlobals = _.filter(deps.global, function (dep) {
      // Use either the command (if object) or the literal dep (if string)
      return !shell.which(dep.command || dep);
    });

    // If there are any missing globals, notify the user of them
    if (_.some(missingGlobals)) {
      this.log([
        '\nBefore the project is completely finished you seem to be missing a couple of CLI tools, you must first to run:\n',
        '\nnpm install -g ',
        _.map(missingGlobals, function (dep) { return dep.name || dep; }).join(' '),
        '\n\nThen it\'s just to run ' + chalk.inverse('git init') + ' and then build something awesome!'
      ].join(''));

      shell.exit(1);
    } else {
      this.log('Now it\'s just to run ' + chalk.inverse('git init') + ' and then build something awesome!');
    }
  }
});
