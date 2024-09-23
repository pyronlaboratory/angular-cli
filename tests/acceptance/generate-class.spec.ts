import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

const testPath = path.join(root, 'tmp', 'foo', 'src', 'app');

describe('Acceptance: ng generate class', () => {
  // Tests ng generate class functionality.
  setupProject();

  it('ng generate class my-class', (done) => {
    // Generates a class using Angular CLI.
    return ng(['generate', 'class', 'my-class']).then(() => {
      // Asserts file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate class my-class --no-spec', (done) => {
    // Tests class generation.
    return ng(['generate', 'class', 'my-class', '--no-spec']).then(() => {
      // Asserts file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate class my-class.model', (done) => {
    // Generates an Angular class model file.
    return ng(['generate', 'class', 'my-class.model']).then(() => {
      // Awaits file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.model.ts'))).toBe(true);
    })
    .then(done, done.fail);
  });
});
