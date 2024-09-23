// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

describe('Acceptance: ng generate directive', () => {
  // Generates directives for Angular projects.
  setupProject();

  it('flat', (done) => {
    // Generates a flat directive.
    return ng(['generate', 'directive', 'flat'])
      .then(() => {
        // Checks for file existence.
        const testPath = path.join(root, 'tmp/foo/src/app/flat.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('my-dir --flat false', (done) => {
    // Generates a directive and verifies its presence.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false'])
      .then(() => {
        // Checks file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then(content => {
        // Verifies file contents.
        expect(content).toMatch(/import.*\bMyDirDirective\b.*from '.\/my-dir\/my-dir.directive';/);
        expect(content).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+MyDirDirective\r?\n/m);
      })
      .then(done, done.fail);
  });

  it('my-dir --flat false --no-spec', (done) => {
    // Generates a directive with specifications disabled.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false', '--no-spec'])
      .then(() => {
        // Checks file existence after directive generation.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('test' + path.sep + 'my-dir', (done) => {
    // Tests directive generation.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'directive', 'test' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        // Verifies test file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('test' + path.sep + '..' + path.sep + 'my-dir', (done) => {
    // Generates a directive file and verifies its existence.
    return ng(['generate', 'directive', 'test' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        // Verifies file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('my-dir from a child dir', (done) => {
    // Tests creation of an Angular directive.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Sets environment variable and calls Angular CLI command.
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        // Tests file existence.
        const testPath =
          path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('child-dir' + path.sep + 'my-dir from a child dir', (done) => {
    // Tests directive generation within a deeply nested directory structure.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates an Angular directive.
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'child-dir' + path.sep + 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        // Checks if a file exists.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('child-dir' + path.sep + '..' + path.sep + 'my-dir from a child dir',
    (done) => {
      // Tests directive generation with ng.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Creates a new directive using Angular CLI.
          process.env.CWD = process.cwd();
          return ng(['generate', 'directive', 'child-dir' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false']);
        })
        .then(() => {
          // Expects a file to exist.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it(path.sep + 'my-dir from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Creates and tests a directive.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Executes an Angular CLI command.
          process.env.CWD = process.cwd();
          return ng(['generate', 'directive', path.sep + 'my-dir', '--flat', 'false']);
        })
        .then(() => {
          // Checks for file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('..' + path.sep + 'my-dir from root dir will fail', (done) => {
    // Tests an invalid path for ng generate directive command.
    return ng(['generate', 'directive', '..' + path.sep + 'my-dir'])
      .then(() => done.fail())
      .catch((err) => {
        // Verifies an error message.
        expect(err).toBe(`Invalid path: "..${path.sep}my-dir" cannot be above the "src${path.sep}app" directory`);
      })
      .then(done, done.fail);
  });

  it('converts dash-cased-name to a camelCasedSelector', (done) => {
    // Generates a directive and checks its selector string.
    const appRoot = path.join(root, 'tmp/foo');
    const directivePath = path.join(appRoot, 'src/app/my-dir.directive.ts');
    return ng(['generate', 'directive', 'my-dir'])
      .then(() => fs.readFile(directivePath, 'utf-8'))
      .then(content => {
        // expect(content).toMatch(/selector: [app-my-dir]/m);
        expect(content).toMatch(/selector: '\[appMyDir\]'/);
      })
      .then(done, done.fail);
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests error handling for incorrect module paths.
    return Promise.resolve()
      .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Verifies an error message.
        expect(error).toBe('Specified module does not exist');
      })
      .then(done, done.fail);
  });

  describe('should import and add to declaration list', () => {
    // Tests directive generation and module imports.
    it('when given a root level module with module.ts suffix', (done) => {
      // Tests directive generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates expected code changes.
          expect(content).toMatch(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Generates a directive with Angular CLI.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts content matches expectations.
          expect(content).toMatch(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Tests module generation and integration.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates module content.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Generates and tests a module.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks content matches specific patterns.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Tests an Angular module generation scenario.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates generated code.
          expect(content).toMatch(/import.*BazDirective.*from '..\/..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });
  });
});
