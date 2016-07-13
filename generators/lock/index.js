'use strict'

var generators = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var shell = require('shelljs');
var fs = require('fs');

module.exports = generators.Base.extend({

  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.log('Locking versions of dependencies and dev-dependencies in local package.json file.');
  },

  writing: function () {
    // This function must be async.
    var done = this.async();

    var spaces = _.attempt(function () {
      return this.fs.read(this.destinationPath('package.json')).match(/\{\n(\s+)(?=\")/)[1].length;
    }.bind(this));

    if (_.isError(spaces)) {
      spaces = 4;
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

    // Lock the dependencies
    var dependencies = _.chain(_package)
      .pick('dependencies')
      .thru(function (obj) { return obj.dependencies; })
      .map(function (val, key) { return { key: key, val: val }; })
      .map(function (dep) { return _.assign({}, dep, { val: dep.val.replace(/[^a-z0-9.:\/]/ig, '') }); })
      .reduce(function (obj, item) {
        var o = {};
        o[item.key] = item.val;
        return _.assign({}, obj, o);
      }, {})
      .value();

    // Lock the devDependencies
    var devDependencies = _.chain(_package)
      .pick('devDependencies')
      .thru(function (obj) { return obj.devDependencies; })
      .map(function (val, key) { return { key: key, val: val }; })
      .map(function (dep) { return _.assign({}, dep, { val: dep.val.replace(/[^a-z0-9.]/ig, '') }); })
      .reduce(function (obj, item) {
        var o = {};
        o[item.key] = item.val;
        return _.assign({}, obj, o);
      }, {})
      .value();

    // Update the dependencies and devDependencies
    _package = _.assign({}, _package, { dependencies: dependencies, devDependencies: devDependencies });

    // Write the file
    fs.writeFileSync(
      this.destinationPath('package.json'),
      JSON.stringify(_package, null, spaces),
      { encoding: 'utf8' }
    );

    this.depsLocked = true;

    // Finished
    done();
  },

  end: function () {
    if (this.depsLocked) {
      this.log(
        chalk.green('\nDependencies locked\n')
      );
    }

    this.log('Exiting...')
  }

});