import cli from '@angular/cli/lib/cli';
const UI = require('@angular/cli/ember-cli/lib/ui');
const through = require('through');

/**
 * @description Initializes a mock user interface with two output streams: one for
 * regular data and another for error messages. The regular output stream accumulates
 * data into an instance variable, while the error stream adds data to a separate
 * instance variable.
 */
function MockUI() {
  this.output = '';

  UI.call(this, {
    inputStream: through(),
    outputStream: through(function (data: any) {
      this.output += data;
    }.bind(this)),
    errorStream: through(function (data: any) {
      this.errors += data;
    }.bind(this))
  });
}

MockUI.prototype = Object.create(UI.prototype);
MockUI.prototype.constructor = MockUI;
MockUI.prototype.clear = function () {
  this.output = '';
};

/**
 * @description Initializes an environment for a command-line interface (CLI) to
 * execute, setting the current working directory and passing user-provided arguments,
 * input streams, output streams, and UI settings to the `cli` function for further
 * processing.
 *
 * @param {any} args - Used to pass command line arguments.
 *
 * @returns {object} Result of calling `cli` function with a specific set of parameters.
 */
export function ng(args: any) {
  process.env.PWD = process.cwd();

  return cli({
    inputStream: [],
    outputStream: [],
    cliArgs: args,
    UI: MockUI,
    testing: true
  });
}
