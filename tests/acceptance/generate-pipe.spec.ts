import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();


describe('Acceptance: ng generate pipe', () => {
  // Generates Angular pipes.
  setupProject();

  it('ng generate pipe my-pipe', (done) => {
    // Generates and tests a new pipe.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-pipe.pipe.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-pipe.pipe.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');
    return ng(['generate', 'pipe', 'my-pipe'])
      .then(() => {
        // Expects file paths to exist synchronously.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks file content.
        expect(content).toMatch(/import.*\bMyPipePipe\b.*from '.\/my-pipe.pipe';/);
        expect(content).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+MyPipePipe\r?\n/m);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe my-pipe --no-spec', (done) => {
    // Generates a pipe named "my-pipe" without generating its test file.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-pipe.pipe.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-pipe.pipe.spec.ts');

    return ng(['generate', 'pipe', 'my-pipe', '--no-spec'])
      .then(() => {
        // Asserts expected file system conditions.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe test' + path.sep + 'my-pipe', (done) => {
    // Generates a test pipe file using Angular CLI commands.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'pipe', 'test' + path.sep + 'my-pipe']).then(() => {
      // Checks file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-pipe.pipe.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate pipe test' + path.sep + '..' + path.sep + 'my-pipe', (done) => {
    // Generates a pipe test file with ng CLI.
    return ng(['generate', 'pipe', 'test' + path.sep + '..' + path.sep + 'my-pipe']).then(() => {
      // Checks for file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-pipe.pipe.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate pipe my-pipe from a child dir', (done) => {
    // Generates an Angular pipe named "my-pipe" from within a child directory using the
    // Angular CLI ("ng").
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates a new Angular pipe.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'my-pipe']);
      })
      .then(() => {
        // Tests file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe child-dir' + path.sep + 'my-pipe from a child dir', (done) => {
    // Tests ng generate pipe command from within a child directory.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Changes environment variable and runs Angular CLI command.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'child-dir' + path.sep + 'my-pipe']);
      })
      .then(() => {
        // Verifies file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  // tslint:disable-next-line:max-line-length
  it('ng generate pipe child-dir' + path.sep + '..' + path.sep + 'my-pipe from a child dir', (done) => {
    // Generates an Angular pipe.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates a pipe in Angular.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'child-dir' + path.sep + '..' + path.sep + 'my-pipe']);
      })
      .then(() => {
        // Verifies file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe ' + path.sep + 'my-pipe from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Generates an Angular pipe with the specified name and location.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates an Angular pipe named "my-pipe".
          process.env.CWD = process.cwd();
          return ng(['generate', 'pipe', path.sep + 'my-pipe']);
        })
        .then(() => {
          // Checks file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-pipe.pipe.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
    });

  it('ng generate pipe ..' + path.sep + 'my-pipe from root dir will fail', (done) => {
    // Tests ng generate pipe with invalid path.
    return ng(['generate', 'pipe', '..' + path.sep + 'my-pipe'])
      .then(() => done.fail())
      .catch(err => {
      // tslint:disable-next-line:max-line-length
      expect(err).toBe(`Invalid path: "..${path.sep}my-pipe" cannot be above the "src${path.sep}app" directory`);
      done();
    });
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests an error scenario with ng command.
    return Promise.resolve()
      .then(() => ng(['generate', 'pipe', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Catches errors.
        expect(error).toBe('Specified module does not exist');
        done();
      });
  });

  describe('should import and add to declaration list', () => {
    // Tests pipe generation and module import.
    it('when given a root level module with module.ts suffix', (done) => {
      // Generates and tests a new Angular pipe.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates code content.
          expect(content).toMatch(/import.*BazPipe.*from '.\/baz.pipe';/);
          // tslint:disable-next-line:max-line-length
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazPipe\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Tests Angular pipe generation with missing module suffix.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks expected content.
          expect(content).toMatch(/import.*BazPipe.*from '.\/baz.pipe';/);
          // tslint:disable-next-line:max-line-length
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazPipe\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Generates and tests module code.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies expected content.
          expect(content).toMatch(/import.*BazPipe.*from '..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Tests pipe generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies content matches expectations.
          expect(content).toMatch(/import.*BazPipe.*from '..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Generates a module with a custom pipe.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks file content against expected regular expressions.
          expect(content).toMatch(/import.*BazPipe.*from '..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks expected content.
          expect(content).toMatch(/import.*BazPipe.*from '..\/..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });
  });
});
