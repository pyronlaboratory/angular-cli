import * as fs from 'fs-extra';
import * as path from 'path';
import { ng, setupProject } from '../helpers';

const root = process.cwd();


describe('Acceptance: ng generate service', () => {
  // Tests an Angular CLI command to generate services.
  setupProject();

  it('ng generate service my-svc', (done) => {
    // Tests generation of service.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-svc.service.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-svc.service.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'service', 'my-svc'])
      .then(() => {
        // Checks file existence.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks file content.
        expect(content).not.toMatch(/import.*\MySvcService\b.*from '.\/my-svc.service';/);
        expect(content).not.toMatch(/providers:\s*\[MySvcService\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate service my-svc --no-spec', (done) => {
    // Tests generating an Angular service.
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-svc.service.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-svc.service.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'service', 'my-svc', '--no-spec'])
      .then(() => {
        // Verifies expected file system states.
        expect(fs.pathExistsSync(testPath)).toBe(true);
        expect(fs.pathExistsSync(testSpecPath)).toBe(false);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then((content: string) => {
        // Checks file content.
        expect(content).not.toMatch(/import.*\MySvcService\b.*from '.\/my-svc.service';/);
        expect(content).not.toMatch(/providers:\s*\[MySvcService\]/m);
      })
      .then(done, done.fail);
  });

  it('ng generate service test' + path.sep + 'my-svc', (done) => {
    // Tests file generation.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'service', 'test' + path.sep + 'my-svc']).then(() => {
      // Checks file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-svc.service.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate service test' + path.sep + '..' + path.sep + 'my-svc', (done) => {
    // Generates a service file.
    return ng(['generate', 'service', 'test' + path.sep + '..' + path.sep + 'my-svc']).then(() => {
      // Verifies file existence.
      const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-svc.service.ts');
      expect(fs.pathExistsSync(testPath)).toBe(true);
    })
    .then(done, done.fail);
  });

  it('ng generate service my-svc from a child dir', (done) => {
    // Generates an Angular service.
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
        return ng(['generate', 'service', 'my-svc']);
      })
      .then(() => {
        // Verifies file existence.
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-svc.service.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate service child-dir' + path.sep + 'my-svc from a child dir', (done) => {
    // Generates an Angular service.
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        // Sets environment variable and runs Angular CLI command.
        process.env.CWD = process.cwd();
        return ng(['generate', 'service', 'child-dir' + path.sep + 'my-svc']);
      })
      .then(() => {
        // Checks file existence.
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-svc.service.ts');
        expect(fs.pathExistsSync(testPath)).toBe(true);
      })
      .then(done, done.fail);
  });

  it('ng generate service child-dir' + path.sep + '..' + path.sep + 'my-svc from a child dir',
    (done) => {
      // Generates an Angular service.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Generates Angular service.
          process.env.CWD = process.cwd();
          return ng(
            ['generate', 'service', 'child-dir' + path.sep + '..' + path.sep + 'my-svc']);
        })
        .then(() => {
          // Checks for file existence.
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-svc.service.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate service ' + path.sep + 'my-svc from a child dir, gens under ' +
    path.join('src', 'app'),
    (done) => {
      // Tests ng generate service command execution.
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          // Sets an environment variable and calls a CLI tool with arguments to generate a new
          // service.
          process.env.CWD = process.cwd();
          return ng(['generate', 'service', path.sep + 'my-svc']);
        })
        .then(() => {
          // Checks for file existence.
          const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-svc.service.ts');
          expect(fs.pathExistsSync(testPath)).toBe(true);
        })
        .then(done, done.fail);
    });

  it('ng generate service ..' + path.sep + 'my-svc from root dir will fail', (done) => {
    // Tests an ng generate service command with an invalid path.
    return ng(['generate', 'service', '..' + path.sep + 'my-svc'])
      .then(() => done.fail())
      .catch((err: string) => {
        // tslint:disable-next-line:max-line-length
        expect(err).toBe(`Invalid path: "..${path.sep}my-svc" cannot be above the "src${path.sep}app" directory`);
        done();
      });
  });

  it('should error out when given an incorrect module path', (done) => {
    // Tests an error scenario with ng generate command.
    return Promise.resolve()
      .then(() => ng(['generate', 'service', 'baz', '--module', 'foo']))
      .then(() => done.fail())
      .catch((error) => {
        // Captures and asserts error message.
        expect(error).toBe('Specified module does not exist');
        done();
      });
  });

  describe('should import and add to provider list', () => {
    // Tests ng module generation.
    it('when given a root level module with module.ts suffix', (done) => {
      // Generates and tests an Angular module.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'service', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates generated code content.
          expect(content).toMatch(/import.*BazService.*from '.\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a root level module with missing module.ts suffix', (done) => {
      // Generates a service and checks its registration.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'service', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts expected code content.
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
          // Validates content against regex patterns.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule with missing module.ts suffix', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'service', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Validates file content against expected regex patterns.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });

    it('when given a submodule folder', (done) => {
      // Tests module generation.
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'service', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Asserts file content matches expectations.
          expect(content).toMatch(/import.*BazService.*from '..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
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
        .then(() => ng(['generate', 'service', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          // Verifies file content matches expected patterns.
          expect(content).toMatch(/import.*BazService.*from '..\/..\/baz.service';/);
          expect(content).toMatch(/providers:\s*\[BazService\]/m);
        })
        .then(done, done.fail);
    });
  });
});
