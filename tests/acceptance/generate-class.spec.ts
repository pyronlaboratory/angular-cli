import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

const testPath = path.join(root, 'tmp', 'foo', 'src', 'app');

describe('Acceptance: ng generate class', () => {
  // Tests ng generate class commands.
  setupProject();

  it('ng generate class my-class', (done) => {
    // Generates Angular class files and asserts their presence.
    return ng(['generate', 'class', 'my-class']).then(() => {
      // Expects generated file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate class my-class --no-spec', (done) => {
    // Tests class generation.
    return ng(['generate', 'class', 'my-class', '--no-spec']).then(() => {
      // Checks file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate class my-class.model', (done) => {
    // Generates a class model.
    return ng(['generate', 'class', 'my-class.model']).then(() => {
      // Checks for file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-class.model.ts'))).toBe(true);
    })
    .then(done, done.fail);
  });
});
