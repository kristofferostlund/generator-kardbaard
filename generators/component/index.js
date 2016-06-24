'use strict'

var generators = require('yeoman-generator');
var Promise = require('bluebird');
var _ = require('lodash');
var chalk = require('chalk');
var shell = require('shelljs');
var fs = require('fs');
var path = require('path');

var utils = require('../utils');
var prompt = require('./component.prompt');

module.exports = generators.Base.extend({
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // Setup answers from config file
    this.answers = this.config.getAll();

    // Get the route name if defined
    this.name = (!!arguments[0] ? arguments[0][0] : undefined);
  },

  initializing: function () {
    this.log('Preparing to create a new Vue component.');
  },

  prompting: function () {
    // This function will await user input,
    // and must therefor be async.
    var done = this.async();

    prompt(this)
    .then(function (_answers) {
      this.name = _.kebabCase((_answers || {}).name);

      // Call the done callback
      done();
    }.bind(this))
    .catch(function (err) {
      console.log(err);
    });
  },

  configuring: function () {
    // Update the config file.
    this.config.save();
    this.config.set(this.answers);
  },

  writing: function () {
    // Name is required
    if (!this.name) {
      return this.log(
        '\n' + chalk.yellow('No name given.') + '\n\n' +
        chalk.red('You must enter a name for the route to be created!') +
        '\n'
      );
    }

    var nameCapitalized = utils.pascalCase(this.name);
    var nameDecapitalized = utils.camelCase(this.name);

    // Get the options to copy files with.
    var _options = _.assign({}, this.answers, { name: this.name, nameDecapitalized: nameDecapitalized, nameCapitalized: nameCapitalized });

    // Copy the files
    utils.copyTemplateFiles(this, 'www/scripts/components', _options);

    // Inject the import
    utils.injectText(
      this,
      'import {nameCapitalized} from \'./{name}/{name}.component\';'
        .replace(/\{nameCapitalized\}/g, _options.nameCapitalized)
        .replace(/\{name\}/g, _options.name),
      this.destinationPath('www/scripts/components/components.js'),
      utils.injectRegex('/// Start inject imports ///', '/// Stop inject imports ///', 'i')
    );

    // Inject the component
    utils.injectText(
      this,
      '\'{nameDecapitalized}\': {nameCapitalized},'
        .replace(/\{nameCapitalized\}/g, _options.nameCapitalized)
        .replace(/\{nameDecapitalized\}/g, _options.nameDecapitalized),
      this.destinationPath('www/scripts/components/components.js'),
      utils.injectRegex('/// Start inject components ///', '/// Stop inject components ///', 'i')
    );

  },

  end: function () {
    console.log('\nComponent created!\n');
  }
});
