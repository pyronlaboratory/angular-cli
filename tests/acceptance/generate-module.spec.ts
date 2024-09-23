// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

const testPath = path.join(root, 'tmp', 'foo', 'src', 'app');

describe('Acceptance: ng generate module', () => {
  // Tests ng generate module command's behavior.
  setupProject();

  it('will fail if no name is specified', (done) => {
    // Tests command execution failure.
    return ng(['generate', 'module']).catch((error: string) => {
      // Expects error message matches.
      expect(error).toBe('The `ng generate module` command requires a name to be specified.');
    })
    .then(done, done.fail);
  });

  it('ng generate module my-module', (done) => {
    // Tests Angular module generation.
    return ng(['generate', 'module', 'my-module']).then(() => {
      // Checks file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate module  generate routing file when passed flag --routing', (done) => {
    // Tests generation of an Angular routing module.
    return ng(['generate', 'module', 'my-module', '--routing']).then(() => {
      // Asserts file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module-routing.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate module my-module --spec', (done) => {
    // Tests the creation of an Angular module with specs.
    return ng(['generate', 'module', 'my-module', '--spec']).then(() => {
      // Asserts file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'my-module', 'my-module.module.spec.ts'))).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate module TwoWord', (done) => {
    // Generates an Angular module named "TwoWord" using the CLI command 'ng generate'.
    return ng(['generate', 'module', 'TwoWord']).then(() => {
      // Checks file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'two-word', 'two-word.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'two-word', 'two-word.module.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  it('ng generate module parent/child', (done) => {
    // Generates Angular modules.
    return ng(['generate', 'module', 'parent'])
      .then(() => ng(['generate', 'module', 'parent/child']))
      .then(() => {
        // Validates file existence.
        expect(fs.pathExistsSync(path.join(testPath, 'parent/child', 'child.module.ts'))).toBe(true);
        expect(fs.pathExistsSync(path.join(testPath, 'parent/child', 'child.module.spec.ts'))).toBe(false);
      })
      .then(done, done.fail);
  });

  it('ng generate module child should work in sub-dir', (done) => {
    // Generates a new Angular module in a subdirectory.
    fs.mkdirSync(path.join(testPath, './sub-dir'));
    return new Promise(resolve => {
      process.chdir(path.join(testPath, './sub-dir'));
      return resolve();
    })
    .then(() => ng(['generate', 'module', 'child']))
    .then(() => {
      // Checks file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'sub-dir/child', 'child.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'sub-dir/child', 'child.module.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  // tslint:disable-next-line:max-line-length
  it('ng generate module child should work in sub-dir with routing file when passed --routing flag', (done) => {
    // Generates an Angular module and asserts its existence in a subdirectory with routing
    // file.
    fs.mkdirSync(path.join(testPath, './sub-dir'));
    return new Promise(resolve => {
      process.chdir(path.join(testPath, './sub-dir'));
      return resolve();
    })
    .then(() => ng(['generate', 'module', 'child', '--routing']))
    .then(() => {
      // Expects file existence.
      expect(fs.pathExistsSync(path.join(testPath, 'sub-dir/child', 'child.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'sub-dir/child', 'child-routing.module.ts'))).toBe(true);
      expect(fs.pathExistsSync(path.join(testPath, 'sub-dir/child', 'child.module.spec.ts'))).toBe(false);
    })
    .then(done, done.fail);
  });

  // tslint:disable-next-line:max-line-length
  it('ng generate module should generate parent/child module with routing file when passed --routing flag', (done) => {
    // Tests ng generate module functionality.
    return ng(['generate', 'module', 'parent'])
      .then(() => ng(['generate', 'module', 'parent/child', '--routing']))
      .then(() => {
        // Checks file existence.
        expect(fs.pathExistsSync(path.join(testPath, 'parent/child', 'child.module.ts'))).toBe(true);
        expect(fs.pathExistsSync(path.join(testPath, 'parent/child', 'child-routing.module.ts'))).toBe(true);
        expect(fs.pathExistsSync(path.join(testPath, 'parent/child', 'child.module.spec.ts'))).toBe(false);
      })
      .then(done, done.fail);
  });
});
