// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as path from 'path';
import { ng } from '../helpers';

const tmp = require('../helpers/tmp');


describe('Acceptance: ng new', function () {
  // Runs acceptance tests for ng new command.
  let originalTimeout: number;

  beforeEach((done) => {
    // Increase timeout for these tests only.
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    spyOn(console, 'error');
    // symlink custom collections to node_modules, so we can use with ng new
    // it is a bit dirty, but bootstrap-local tricks won't work here
    fs.symlinkSync(`${process.cwd()}/tests/collections/@custom`, `./node_modules/@custom`, 'dir');

    tmp.setup('./tmp')
      .then(() => process.chdir('./tmp'))
      .then(() => done());
  }, 10000);

  afterEach((done) => {
    // Executes after each test.
    fs.unlinkSync(path.join(__dirname, '/../../node_modules/@custom'));
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    tmp.teardown('./tmp').then(() => done());
  });

  it('requires a valid name (!)', (done) => {
    // Tests invalid package name creation with ng new command.
    return ng(['new', '!', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-.)', (done) => {
    // Tests Angular CLI installation with an invalid project name.
    return ng(['new', 'abc-.', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-)', (done) => {
    // Tests an error case when creating a new project with an invalid name.
    return ng(['new', 'abc-', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-def-)', (done) => {
    // Tests a new Angular CLI installation with an invalid project name.
    return ng(['new', 'abc-def-', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-123)', (done) => {
    // Tests CLI command with invalid name.
    return ng(['new', 'abc-123', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc)', (done) => {
    // Tests a new Angular project creation with an invalid name.
    return ng(['new', 'abc', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done(), () => done.fail());
  });
  it('requires a valid name (abc-def)', (done) => {
    // Tests an Angular CLI command creation with invalid name.
    return ng(['new', 'abc-def', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done(), () => done.fail());
  });

  it('ng new foo, where foo does not yet exist, works', (done) => {
    // Tests an Angular CLI command creation.
    return ng(['new', 'foo', '--skip-install'])
      .then(() => {
        // Asserts file existence.
        expect(fs.pathExistsSync('../foo'));
        expect(fs.pathExistsSync('package.json'));
      })
      .then(done, done.fail);
  });

  it('ng new with empty app does throw exception', (done) => {
    // Verifies an error occurs when attempting to create a new Angular app with an empty
    // name.
    return ng(['new', ''])
      .then(() => done.fail(), () => done());
  });

  it('ng new without app name does throw exception', (done) => {
    // Tests whether invoking 'ng new' without an app name throws an exception.
    return ng(['new'])
      .then(() => done.fail(), () => done());
  });

  it('ng new with app name creates new directory and has a dasherized package name', (done) => {
    // Creates and tests a new Angular app directory with a specific name.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Executes assertions.
      expect(!fs.pathExistsSync('FooApp'));

      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkgJson.name).toBe('foo-app');
    })
    .then(done, done.fail);
  });

  it('ng new has a .editorconfig file', (done) => {
    // Tests if ng new command generates an editorconfig file.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Verifies installation results.
      expect(!fs.pathExistsSync('FooApp'));

      const editorConfig = fs.readFileSync('.editorconfig', 'utf8');
      expect(editorConfig).toBeDefined();
    })
    .then(done, done.fail);
  });

  it('Cannot run ng new, inside of Angular CLI project', (done) => {
    // Tests an error case for 'ng new' inside an Angular CLI project.
    return ng(['new', 'foo', '--skip-install', '--skip-git'])
      .then(() => {
        // Calls ng with arguments, then checks for existence of a directory after execution.
        return ng(['new', 'foo', '--skip-install', '--skip-git']).then(() => {
          // Handles promise rejection or resolution.
          done.fail();
        }, () => {
          expect(!fs.pathExistsSync('foo'));
        });
      })
      .then(done, done.fail);
  });

  it('ng new without skip-git flag creates .git dir', (done) => {
    // Tests ng new command.
    return ng(['new', 'foo', '--skip-install']).then(() => {
      // Checks Git presence.
      expect(fs.pathExistsSync('.git'));
    })
    .then(done, done.fail);
  });

  it('ng new with --dry-run does not create new directory', (done) => {
    // Tests an Angular CLI command.
    return ng(['new', 'foo', '--dry-run']).then(() => {
      // Checks test expectations.
      const cwd = process.cwd();
      expect(cwd).not.toMatch(/foo/, 'does not change cwd to foo in a dry run');
      expect(fs.pathExistsSync(path.join(cwd, 'foo'))).toBe(false, 'does not create new directory');
      expect(fs.pathExistsSync(path.join(cwd, '.git'))).toBe(false, 'does not create git in current directory');
    })
    .then(done, done.fail);
  });

  it('ng new with --directory uses given directory name and has correct package name', (done) => {
    // Tests Angular CLI command 'ng new'.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--directory=bar'])
      .then(() => {
        // Verifies directory and package naming during file creation.
        const cwd = process.cwd();
        expect(cwd).not.toMatch(/foo/, 'does not use app name for directory name');
        expect(fs.pathExistsSync(path.join(cwd, 'foo'))).toBe(false, 'does not create new directory with app name');

        expect(cwd).toMatch(/bar/, 'uses given directory name');
        expect(fs.pathExistsSync(path.join(cwd, '..', 'bar'))).toBe(true, 'creates new directory with specified name');

        const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        expect(pkgJson.name).toBe('foo', 'uses app name for package name');
      })
      .then(done, done.fail);
  });

  it('ng new --inline-template does not generate a template file', (done) => {
    // Tests an Angular command-line interface (CLI) invocation.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => {
        // Checks for file existence.
        const templateFile = path.join('src', 'app', 'app.component.html');
        expect(fs.pathExistsSync(templateFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('ng new --inline-style does not gener a style file', (done) => {
    // Tests style file generation with ng new command.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--inline-style'])
      .then(() => {
        // Verifies non-existence of a file.
        const styleFile = path.join('src', 'app', 'app.component.css');
        expect(fs.pathExistsSync(styleFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('should skip spec files when passed --skip-tests', (done) => {
    // Tests skipping of spec files.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--skip-tests'])
      .then(() => {
        // Verifies file non-existence.
        const specFile = path.join('src', 'app', 'app.component.spec.ts');
        expect(fs.pathExistsSync(specFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('should specify a version of the CLI', (done) => {
    // Tests CLI version specification.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Parses package.json and asserts CLI version.
      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkgJson.devDependencies['@angular/cli']).toMatch(/\d+\.\d+\.\d+/);
    })
    .then(done, done.fail);
  });

  it('should support passing a custom collection', (done) => {
    // Tests ng CLI command.
    return ng(['new', 'foo', '--collection=@custom/application', '--skip-install', '--skip-git']).then(() => {
      // Expects file read to succeed.
      expect(() => fs.readFileSync('emptyapp', 'utf8')).not.toThrow();
    })
    .then(done, done.fail);
  });
});
