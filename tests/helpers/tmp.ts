import * as fs from 'fs-extra';

const root = process.cwd();

/**
 * @description Changes the current working directory to a specified root, removes
 * an existing directory at a given path, and creates a new directory in its place
 * synchronously. The operation is asynchronous until the removal is completed.
 *
 * @param {string} path - Used for directory creation and removal.
 *
 * @returns {Promise<void>} Resolved when the directory at the specified path has
 * been created successfully, and rejected otherwise.
 */
export function setup(path: string) {
  process.chdir(root);

  return fs.remove(path).then(function () {
    // Creates a directory synchronously.
    fs.mkdirsSync(path);
  });
};

/**
 * @description Navigates to a root directory, checks for the existence of a specified
 * path, and deletes it if present; otherwise, it resolves without performing any action.
 *
 * @param {string} path - A directory path to be removed.
 *
 * @returns {Promise<void>} Resolved when a directory at the given path exists and
 * can be removed successfully, otherwise it is resolved with no change to the system
 * state.
 */
export function teardown(path: string) {
  process.chdir(root);

  if (fs.pathExistsSync(path)) {
    return fs.remove(path);
  } else {
    return Promise.resolve();
  }
};
