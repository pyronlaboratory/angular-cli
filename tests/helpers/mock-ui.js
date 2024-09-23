'use strict';

const UI = require('@angular/cli/ember-cli/lib/ui');
const through = require('through');

module.exports = MockUI;
/**
 * @description Sets up a mock user interface for testing purposes, using the `through`
 * library to create streams for input and output. It allows data passed through the
 * output stream to be accumulated in the `output` property of the object instance.
 */
function MockUI() {
  this.output = '';

  UI.call(this, {
    inputStream: through(),
    outputStream: through(function (data) {
      this.output += data;
    }.bind(this)),
    errorStream: through(function (data) {
      this.errors += data;
    }.bind(this))
  });
}

MockUI.prototype = Object.create(UI.prototype);
MockUI.prototype.constructor = MockUI;
MockUI.prototype.clear = function () {
  this.output = '';
};
