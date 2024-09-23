import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

describe('Acceptance: ng generate guard', function () {
  // Tests an Angular CLI command.
  setupProject();

  it('ng generate guard my-guard', (done) => {
    // Generates Angular guard code.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-guard.guard.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-guard.guard.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'guard', 'my-guard'])
      .then(() => {
        // Asserts test files exist.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks file content.
        expect(content).not.toMatch(/import.*MyGuardGuard.*from '.\/my-guard.guard';/);
        expect(content).not.toMatch(/providers:\s*\[MyGuardGuard\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate guard my-guard --no-spec', (done) => {
    // Generates a guard and tests its absence from app module.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-guard.guard.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-guard.guard.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'guard', 'my-guard', '--no-spec'])
      .then(() => {
        // Asserts file existence conditions.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Reads app module and asserts its content does not contain specific imports or providers.
        expect(content).not.toMatch(/import.*MyGuardGuard.*from '.\/my-guard.guard';/);
        expect(content).not.toMatch(/providers:\s*\[MyGuardGuard\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate guard test' + path.sep + 'my-guard', (done) => {
    // Generates a test guard.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'guard', 'test' + path.sep + 'my-guard']).then(() => {
      // Checks file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-guard.guard.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate guard test' + path.sep + '..' + path.sep + 'my-guard', (done) => {
    // Tests generation of an Angular guard file.
    return ng(['generate', 'guard', 'test' + path.sep + '..' + path.sep + 'my-guard']).then(() => {
      // Checks file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-guard.guard.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate guard my-guard from a child dir', (done) => {
    // Generates a guard file using the ng command.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Sets environment variable and executes command using Angular CLI.
        process.env.CWD = process.cwd();
        return ng(['generate', 'guard', 'my-guard']);
      })
      .then(() => {
        // Checks for file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-guard.guard.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate guard child-dir' + path.sep + 'my-guard from a child dir', (done) => {
    // Tests ng generate command execution.
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
        // Checks file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-guard.guard.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate guard child-dir' + path.sep + '..' + path.sep + 'my-guard from a child dir',
    (done) => {
      // Generates a guard file from child directory.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Changes environment variable and executes an Angular command.
          process.env.CWD = process.cwd();
          return ng(
            ['generate', 'guard', 'child-dir' + path.sep + '..' + path.sep + 'my-guard']);
        })
        .then(() => {
          // Verifies file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-guard.guard.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate guard ' + path.sep + 'my-guard from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Tests an Angular generator command.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Executes an Angular command.
          process.env.CWD = process.cwd();
          return ng(['generate', 'guard', path.sep + 'my-guard']);
        })
        .then(() => {
          // Checks for file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-guard.guard.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate guard ..' + path.sep + 'my-guard from root dir will fail', (done) => {
    // Tests generation of invalid guard.
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
        // Expects a specific error message.
        expect(error).toBe('Specified module does not exist');
      })
      .then(done, done.fail);
  });

  describe('should import and add to provider list', () => {
    // Tests Angular Guard generation.
    it('when given a root level module with module.ts suffix', (done) => {
      // Tests generation of a guard.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected content.
          expect(content).toMatch(/import.*BazGuard.*from '.\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Generates a guard in an Angular app.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies file content matches certain patterns.
          expect(content).toMatch(/import.*BazGuard.*from '.\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks file content against expected patterns.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts file content matches expected patterns.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Verifies a module generation process.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'guard', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected module content.
          expect(content).toMatch(/import.*BazGuard.*from '..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Generates Angular module and guard files.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'guard', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected file content.
          expect(content).toMatch(/import.*BazGuard.*from '..\/..\/baz.guard';/);
          expect(content).toMatch(/providers:\s*\[BazGuard\]/m);
        })
        .then(done, done.fail);
    });
  });
});
