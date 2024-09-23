const ng: ((parameters: string[]) => Promise<any>) = require('./ng');
const tmp = require('./tmp');

/**
 * @description Sets up a test environment for Angular projects by creating a temporary
 * directory, initializing an Angular project with a specified name, and then executing
 * tests before and after each iteration within a time limit.
 */
export function setupProject() {
  beforeEach((done) => {
    // Sets up test environment.
    spyOn(console, 'error');

    tmp.setup('./tmp')
      .then(() => process.chdir('./tmp'))
      .then(() => ng(['new', 'foo', '--skip-install']))
      .then(done, done.fail);
  }, 10000);

  afterEach((done) => {
    // Cleans up temporary files.
    tmp.teardown('./tmp').then(done, done.fail);
  });
}

export {
  ng
};
