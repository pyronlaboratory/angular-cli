import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

describe('Acceptance: ng generate guard', function () {
  // Tests ng generate guard functionality.
  setupProject();

  it('ng generate guard my-guard', (done) => {
    // Tests generation of a guard.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-guard.guard.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-guard.guard.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'guard', 'my-guard'])
      .then(() => {
        // Awaits two conditions to be true.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks app content for specific patterns.
        expect(content).not.toMatch(/import.*MyGuardGuard.*from '.\/my-guard.guard';/);
        expect(content).not.toMatch(/providers:\s*\[MyGuardGuard\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate guard my-guard --no-spec', (done) => {
    // Generates an Angular guard with specifications omitted.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-guard.guard.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-guard.guard.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'guard', 'my-guard', '--no-spec'])
      .then(() => {
        // Awaits test generation verification.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Verifies file content.
        expect(content).not.toMatch(/import.*MyGuardGuard.*from '.\/my-guard.guard';/);
        expect(content).not.toMatch(/providers:\s*\[MyGuardGuard\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate guard test' + path.sep + 'my-guard', (done) => {
    // Tests Angular CLI guard generation.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'guard', 'test' + path.sep + 'my-guard']).then(() => {
      // Checks for file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-guard.guard.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate guard test' + path.sep + '..' + path.sep + 'my-guard', (done) => {
    // Runs an Angular generator command to create a guard test file.
    return ng(['generate', 'guard', 'test' + path.sep + '..' + path.sep + 'my-guard']).then(() => {
      // Verifies file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-guard.guard.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate guard my-guard from a child dir', (done) => {
    // Tests ng generate guard command.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Sets and returns environment variables.
        process.env.CWD = process.cwd();
        return ng(['generate', 'guard', 'my-guard']);
      })
      .then(() => {
        // Checks file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-guard.guard.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate guard child-dir' + path.sep + 'my-guard from a child dir', (done) => {
    // Generates a guard in Angular from a child directory.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates an Angular guard.
        process.env.CWD = process.cwd();
        return ng(['generate', 'guard', 'child-dir' + path.sep + 'my-guard']);
      })
      .then(() => {
        // Verifies file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-guard.guard.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate guard child-dir' + path.sep + '..' + path.sep + 'my-guard from a child dir',
    (done) => {
      // Generates an Angular guard from a child directory using the 'ng generate' command.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates an Angular guard.
          process.env.CWD = process.cwd();
          return ng(
            ['generate', 'guard', 'child-dir' + path.sep + '..' + path.sep + 'my-guard']);
        })
        .then(() => {
          // Checks file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-guard.guard.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate guard ' + path.sep + 'my-guard from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Tests generation of an Angular guard.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates an Angular guard.
          process.env.CWD = process.cwd();
          return ng(['generate', 'guard', path.sep + 'my-guard']);
        })
        .then(() => {
          // Verifies file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-guard.guard.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate guard ..' + path.sep + 'my-guard from root dir will fail', (done) => {
    // Tests ng generate guard command.
    return ng(['generate', 'guard', '..' + path.sep + 'my-guard'])
      .then(() => done.fail())
      .catch(err => {
        // tslint:disable-next-line:max-line-length
        expect(err).toBe(`Invalid path: "..${path.sep}my-guard" cannot be above the "src${path.sep}app" directory`);
      })
      .then(done, done.fail);
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests an error scenario.
    return Promise.resolve()
      .then(() => ng(['generate', 'guard', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Expects an error message.
        expect(error).toBe('Specified module does not exist');
      })
      .then(done, done.fail);
  });

  describe('should import and add to provider list', () => {
    // Generates and verifies Guards using Angular's ng CLI.
    it('when given a root level module with module.ts suffix', (done) => {
      // Generates and tests Angular guard code.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content.
          expect(content).toMatch(/import.*BazGuard.*from '.\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Generates Angular guard and checks its presence in a module file.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected content.
          expect(content).toMatch(/import.*BazGuard.*from '.\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Generates a module and verifies its contents.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts content.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Validates module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts content matches expected patterns.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Generates an Angular module and guard.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts module content matches expectations.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Generates module with missing suffix and verifies generated code.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies file content matches expectations.
          expect(content).toMatch(/import.*BazGuard.*from '..\/..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });
  });
});
