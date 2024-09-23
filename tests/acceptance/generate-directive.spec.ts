// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();

describe('Acceptance: ng generate directive', () => {
  // Generates Angular directives.
  setupProject();

  it('flat', (done) => {
    // Generates a directive named 'flat' and checks its existence.
    return ng(['generate', 'directive', 'flat'])
      .then(() => {
        // Checks file existence.
        const testPath = path.join(root, 'tmp/foo/src/app/flat.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('my-dir --flat false', (done) => {
    // Tests directive generation.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false'])
      .then(() => {
        // Expects file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then(content => {
        // Parses file content for expected strings.
        expect(content).toMatch(/import.*\bMyDirDirective\b.*from '.\/my-dir\/my-dir.directive';/);
        expect(content).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+MyDirDirective\r?\n/m);
      })
      .then(done, done.fail);
  });

  it('my-dir --flat false --no-spec', (done) => {
    // Tests directive generation with ng-cli.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false', '--no-spec'])
      .then(() => {
        // Expects file existence conditions.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('test' + path.sep + 'my-dir', (done) => {
    // Runs an Angular generation command for a directive.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'directive', 'test' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        // Waits for file creation.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('test' + path.sep + '..' + path.sep + 'my-dir', (done) => {
    // Generates a directive file and asserts its existence.
    return ng(['generate', 'directive', 'test' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        // Checks for file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('my-dir from a child dir', (done) => {
    // Generates a directive using Angular CLI.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates a directive with Angular CLI.
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        // Checks for file existence.
        const testPath =
          path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('child-dir' + path.sep + 'my-dir from a child dir', (done) => {
    // Tests directive generation.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates Angular directive.
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'child-dir' + path.sep + 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        // Checks file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('child-dir' + path.sep + '..' + path.sep + 'my-dir from a child dir',
    (done) => {
      // Executes an ng generate directive command from within a child directory.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates a directive using Angular CLI ng command.
          process.env.CWD = process.cwd();
          return ng(['generate', 'directive', 'child-dir' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false']);
        })
        .then(() => {
          // Checks file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it(path.sep + 'my-dir from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Generates Angular directive.
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
          // Checks if a file exists synchronously.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('..' + path.sep + 'my-dir from root dir will fail', (done) => {
    // Tests invalid directive path generation.
    return ng(['generate', 'directive', '..' + path.sep + 'my-dir'])
      .then(() => done.fail())
      .catch((err) => {
        // Validates an error message.
        expect(err).toBe(`Invalid path: "..${path.sep}my-dir" cannot be above the "src${path.sep}app" directory`);
      })
      .then(done, done.fail);
  });

  it('converts dash-cased-name to a camelCasedSelector', (done) => {
    // Tests directive generation.
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
    // Tests for error handling when invalid Angular module path is provided.
    return Promise.resolve()
      .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Validates error messages.
        expect(error).toBe('Specified module does not exist');
      })
      .then(done, done.fail);
  });

  describe('should import and add to declaration list', () => {
    // Tests directive generation scenarios.
    it('when given a root level module with module.ts suffix', (done) => {
      // Tests directive generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts file content matches expected patterns.
          expect(content).toMatch(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Tests directive generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content against expected patterns.
          expect(content).toMatch(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Tests Angular module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies file content matches expectations.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Generates and verifies an Angular module with a directive.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected content exists.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts file content matches expected patterns.
          expect(content).toMatch(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Tests Angular module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates code content.
          expect(content).toMatch(/import.*BazDirective.*from '..\/..\/baz.directive';/);
          expect(content).toMatch(/declarations:\s+\[BazDirective]/m);
        })
        .then(done, done.fail);
    });
  });
});
