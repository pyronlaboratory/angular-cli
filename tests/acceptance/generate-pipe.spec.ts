import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();


describe('Acceptance: ng generate pipe', () => {
  // Generates Angular pipes.
  setupProject();

  it('ng generate pipe my-pipe', (done) => {
    // Generates an Angular pipe.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-pipe.pipe.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-pipe.pipe.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');
    return ng(['generate', 'pipe', 'my-pipe'])
      .then(() => {
        // Expects file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Parses Angular module content.
        expect(content).toMatch(/import.*\bMyPipePipe\b.*from '.\/my-pipe.pipe';/);
        expect(content).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+MyPipePipe\r?\n/m);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe my-pipe --no-spec', (done) => {
    // Generates a new Angular pipe named 'my-pipe'.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-pipe.pipe.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-pipe.pipe.spec.ts');

    return ng(['generate', 'pipe', 'my-pipe', '--no-spec'])
      .then(() => {
        // Verifies file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe test' + path.sep + 'my-pipe', (done) => {
    // Generates an Angular pipe test file.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'pipe', 'test' + path.sep + 'my-pipe']).then(() => {
      // Validates file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-pipe.pipe.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate pipe test' + path.sep + '..' + path.sep + 'my-pipe', (done) => {
    // Generates an Angular pipe and tests its existence.
    return ng(['generate', 'pipe', 'test' + path.sep + '..' + path.sep + 'my-pipe']).then(() => {
      // Checks file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-pipe.pipe.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate pipe my-pipe from a child dir', (done) => {
    // Generates a pipe named "my-pipe" from a child directory using Angular CLI command.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Changes environment variable and runs Angular CLI command.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'my-pipe']);
      })
      .then(() => {
        // Checks if a file exists.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe child-dir' + path.sep + 'my-pipe from a child dir', (done) => {
    // Tests ng generate functionality from a child directory.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates an Angular pipe.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'child-dir' + path.sep + 'my-pipe']);
      })
      .then(() => {
        // Tests file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  // tslint:disable-next-line:max-line-length
  it('ng generate pipe child-dir' + path.sep + '..' + path.sep + 'my-pipe from a child dir', (done) => {
    // Generates a new Angular pipe.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Generates an Angular pipe.
        process.env.CWD = process.cwd();
        return ng(['generate', 'pipe', 'child-dir' + path.sep + '..' + path.sep + 'my-pipe']);
      })
      .then(() => {
        // Checks for file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-pipe.pipe.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate pipe ' + path.sep + 'my-pipe from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Generates an Angular pipe.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Sets and returns environment variables and executes an ng command.
          process.env.CWD = process.cwd();
          return ng(['generate', 'pipe', path.sep + 'my-pipe']);
        })
        .then(() => {
          // Verifies file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-pipe.pipe.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
    });

  it('ng generate pipe ..' + path.sep + 'my-pipe from root dir will fail', (done) => {
    // Generates an error when running Angular CLI command.
    return ng(['generate', 'pipe', '..' + path.sep + 'my-pipe'])
      .then(() => done.fail())
      .catch(err => {
      // tslint:disable-next-line:max-line-length
      expect(err).toBe(`Invalid path: "..${path.sep}my-pipe" cannot be above the "src${path.sep}app" directory`);
      done();
    });
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests an ng generate command failure.
    return Promise.resolve()
      .then(() => ng(['generate', 'pipe', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Catches and asserts error conditions.
        expect(error).toBe('Specified module does not exist');
        done();
      });
  });

  describe('should import and add to declaration list', () => {
    // Tests Angular pipe generation.
    it('when given a root level module with module.ts suffix', (done) => {
      // Generates and tests an Angular pipe.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content.
          expect(content).toMatch(/import.*BazPipe.*from '.\/baz.pipe';/);
          // tslint:disable-next-line:max-line-length
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazPipe\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Tests pipe generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates expected content.
          expect(content).toMatch(/import.*BazPipe.*from '.\/baz.pipe';/);
          // tslint:disable-next-line:max-line-length
          expect(content).toMatch(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazPipe\r?\n\s+\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Generates and tests an Angular module with a pipe.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts content matches expected imports and declarations.
          expect(content).toMatch(/import.*BazPipe.*from '..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Tests Angular module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected content matches certain patterns.
          expect(content).toMatch(/import.*BazPipe.*from '..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Tests module and pipe generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'pipe', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates expected file content.
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
          // Verifies file content matches expected regex patterns.
          expect(content).toMatch(/import.*BazPipe.*from '..\/..\/baz.pipe';/);
          expect(content).toMatch(/declarations:\s+\[BazPipe]/m);
        })
        .then(done, done.fail);
    });
  });
});
