import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();


describe('Acceptance: ng generate service', () => {
  // Tests Angular CLI commands for generating services.
  setupProject();

  it('ng generate service my-svc', (done) => {
    // Creates a new service file using Angular CLI.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-svc.service.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-svc.service.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'service', 'my-svc'])
      .then(() => {
        // Asserts file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Verifies code content.
        expect(content).not.toMatch(/import.*\MySvcService\b.*from '.\/my-svc.service';/);
        expect(content).not.toMatch(/providers:\s*\[MySvcService\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate service my-svc --no-spec', (done) => {
    // Generates an Angular service and tests its behavior.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-svc.service.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-svc.service.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'service', 'my-svc', '--no-spec'])
      .then(() => {
        // Asserts file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks file content for specific patterns.
        expect(content).not.toMatch(/import.*\MySvcService\b.*from '.\/my-svc.service';/);
        expect(content).not.toMatch(/providers:\s*\[MySvcService\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate service test' + path.sep + 'my-svc', (done) => {
    // Generates and tests a new Angular service.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'service', 'test' + path.sep + 'my-svc']).then(() => {
      // Asserts file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-svc.service.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate service test' + path.sep + '..' + path.sep + 'my-svc', (done) => {
    // Generates a service file using Angular CLI.
    return ng(['generate', 'service', 'test' + path.sep + '..' + path.sep + 'my-svc']).then(() => {
      // Checks if a file exists.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-svc.service.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate service my-svc from a child dir', (done) => {
    // Tests service generation.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Executes a command-line Angular generator and sets the current working directory
        // as an environment variable.
        process.env.CWD = process.cwd();
        return ng(['generate', 'service', 'my-svc']);
      })
      .then(() => {
        // Asserts file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-svc.service.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate service child-dir' + path.sep + 'my-svc from a child dir', (done) => {
    // Tests ng generate command.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Sets environment variable and runs Angular command.
        process.env.CWD = process.cwd();
        return ng(['generate', 'service', 'child-dir' + path.sep + 'my-svc']);
      })
      .then(() => {
        // Checks for file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-svc.service.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate service child-dir' + path.sep + '..' + path.sep + 'my-svc from a child dir',
    (done) => {
      // Creates a service.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates an Angular service.
          process.env.CWD = process.cwd();
          return ng(
            ['generate', 'service', 'child-dir' + path.sep + '..' + path.sep + 'my-svc']);
        })
        .then(() => {
          // Checks file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-svc.service.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate service ' + path.sep + 'my-svc from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Generates an Angular service file with specified name.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates an Angular service.
          process.env.CWD = process.cwd();
          return ng(['generate', 'service', path.sep + 'my-svc']);
        })
        .then(() => {
          // Checks file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-svc.service.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate service ..' + path.sep + 'my-svc from root dir will fail', (done) => {
    // Tests an ng generate command for failure.
    return ng(['generate', 'service', '..' + path.sep + 'my-svc'])
      .then(() => done.fail())
      .catch((err: string) => {
        // tslint:disable-next-line:max-line-length
        expect(err).toBe(`Invalid path: "..${path.sep}my-svc" cannot be above the "src${path.sep}app" directory`);
        done();
      });
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests an error condition.
    return Promise.resolve()
      .then(() => ng(['generate', 'service', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Handles caught errors.
        expect(error).toBe('Specified module does not exist');
        done();
      });
  });

  describe('should import and add to provider list', () => {
    // Tests service generation.
    it('when given a root level module with module.ts suffix', (done) => {
      // Generates and tests an Angular module.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'service', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Checks file content against expected strings.
          expect(content).toMatch(/import.*BazService.*from '.\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Generates code and asserts its correctness.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'service', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content.
          expect(content).toMatch(/import.*BazService.*from '.\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'service', 'baz', '--module',
          path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Generates a module with a service.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'service', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies file content.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Generates and validates Angular module code.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'service', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected module content.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given deep submodule folder with missing module.ts suffix', (done) => {
      // Tests module generation scenarios.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'service', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts content matches specific patterns.
          expect(content).toMatch(/import.*BazService.*from '..\/..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });
  });
});
