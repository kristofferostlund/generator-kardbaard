'use strict'

var generators = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var shell = require('shelljs');

module.exports = generators.Base.extend({

  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.log('Downloading d.ts files for dependencies and dev-dependencies in local package.json file.');

    if (!shell.which('tsd')) {
      // There is no tsd command
      this.tsdMissing = true;

      this.log(
        '\n' + chalk.red('Cannot install d.ts files as command ' +
        chalk.yellow('tsd') + ' is missing.')  +
        '\n\nYou can install it by running ' +
        chalk.inverse('npm install tsd -g') +
        '\nSource: ' + chalk.blue('http://definitelytyped.org/tsd/') + '\n'
        );
    }
  },

  install: function () {
    // This function must be async.
    var done = this.async();

    if (this.tsdMissing) {
      // There is no tsd command to run!
      return done();
    }

    var _package = _.attempt(function () {
      return JSON.parse(this.fs.read(this.destinationPath('package.json')));
    }.bind(this));

    if (_.isError(_package)) {
      this.log(
        chalk.red('Error parsing package.json file at:') + '\n' +
        chalk.yellow(this.destinationPath('package.json')) + '\n' +
        'Is the project initialized?\n'
      );

      // Carry on
      return done();
    }

    // Get the dependencies and dev-dependencies
    var _deps = _.chain(_package)
      .pick(['dependencies', 'devDependencies'])
      .map(_.keys)
      .flatten()
      .uniq()
      .value()
      .sort();

    // Run the command
    shell.exec(['tsd install'].concat(_deps.concat(['--save'])).join(' '));
    this.tsdInstalled = true;

    // Finished
    done();
  },

  end: function () {
    if (this.tsdInstalled) {
      this.log(
        chalk.green('\nd.ts fiels installed!\n')
      );
    }

    this.log('Exiting...')
  }

});
