import * as path from 'path';
import {writeFile, readFile} from 'fs-extra';
import { ng } from './ng';
import { setup, teardown } from './tmp';

export { ng };

/**
 * @description Sets up a test environment for an Angular project by executing a
 * series of commands in a temporary directory (`./tmp`). It creates a new Angular
 * application, adds it to the project, and changes the current working directory to
 * the temporary location.
 */
export function setupProject() {
  beforeEach((done) => {
    // Sets up a test environment.
    spyOn(console, 'error');

    setup('./tmp')
      .then(() => process.chdir('./tmp'))
      .then(() => ng(['new', 'foo', '--skip-install']))
      .then(() => addAppToProject())
      .then(done, done.fail);
  }, 10000);

  afterEach((done) => {
    // Executes a cleanup task after each test.
    teardown('./tmp').then(done, done.fail);
  });
}

/**
 * @description Adds a new application to an existing Angular project by modifying
 * its `.angular-cli.json` file. It reads the file, parses its JSON content, appends
 * a new app configuration to it, and then writes the updated data back to the file
 * as a new JSON string.
 *
 * @returns {Promise<any>} Resolved with a string containing a JSON object. The JSON
 * object represents an updated Angular CLI configuration file (.angular-cli.json).
 */
function addAppToProject(): Promise<any> {
  const cliJson = path.join(path.join(process.cwd()), '.angular-cli.json');
  return readFile(cliJson, 'utf-8').then(content => {
    // Parses a JSON file and adds an item to its "apps" array.
    const json = JSON.parse(content);
    json.apps.push(({name: 'other', root: 'other/src', appRoot: ''}));
    return json;
  }).then(json => {
    // Writes data to a file.
    return writeFile(cliJson, JSON.stringify(json, null, 2))
  });
}
