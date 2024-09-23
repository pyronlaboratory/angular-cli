// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as path from 'path';
import { ng } from '../helpers';

const tmp = require('../helpers/tmp');


describe('Acceptance: ng new', function () {
  // Tests Angular CLI's ng new functionality.
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
    // Resets setup for each test.
    fs.unlinkSync(path.join(__dirname, '/../../node_modules/@custom'));
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    tmp.teardown('./tmp').then(() => done());
  });

  it('requires a valid name (!)', (done) => {
    // Tests name validation for ng new command.
    return ng(['new', '!', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-.)', (done) => {
    // Tests an invalid project name.
    return ng(['new', 'abc-.', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-)', (done) => {
    // Tests invalid application name.
    return ng(['new', 'abc-', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-def-)', (done) => {
    // Tests creation with an invalid name.
    return ng(['new', 'abc-def-', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc-123)', (done) => {
    // Tests invalid name creation.
    return ng(['new', 'abc-123', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done.fail(), () => done());
  });
  it('requires a valid name (abc)', (done) => {
    // Creates an Angular project with a name 'abc' and various options.
    return ng(['new', 'abc', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done(), () => done.fail());
  });
  it('requires a valid name (abc-def)', (done) => {
    // Tests the creation of a new Angular project with an invalid name.
    return ng(['new', 'abc-def', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => done(), () => done.fail());
  });

  it('ng new foo, where foo does not yet exist, works', (done) => {
    // Creates an Angular project named 'foo' using 'ng new' command.
    return ng(['new', 'foo', '--skip-install'])
      .then(() => {
        // Checks for file existence.
        expect(fs.pathExistsSync('../foo'));
        expect(fs.pathExistsSync('package.json'));
      })
      .then(done, done.fail);
  });

  it('ng new with empty app does throw exception', (done) => {
    // Verifies an error condition.
    return ng(['new', ''])
      .then(() => done.fail(), () => done());
  });

  it('ng new without app name does throw exception', (done) => {
    // Tests an error condition.
    return ng(['new'])
      .then(() => done.fail(), () => done());
  });

  it('ng new with app name creates new directory and has a dasherized package name', (done) => {
    // Creates an Angular application using CLI.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Asserts application state after generation.
      expect(!fs.pathExistsSync('FooApp'));

      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkgJson.name).toBe('foo-app');
    })
    .then(done, done.fail);
  });

  it('ng new has a .editorconfig file', (done) => {
    // Tests if an ng new command creates a valid project with an editorconfig file.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Checks project setup.
      expect(!fs.pathExistsSync('FooApp'));

      const editorConfig = fs.readFileSync('.editorconfig', 'utf8');
      expect(editorConfig).toBeDefined();
    })
    .then(done, done.fail);
  });

  it('Cannot run ng new, inside of Angular CLI project', (done) => {
    // Tests ng new command.
    return ng(['new', 'foo', '--skip-install', '--skip-git'])
      .then(() => {
        // Checks for an error condition.
        return ng(['new', 'foo', '--skip-install', '--skip-git']).then(() => {
          // Handles promise rejections and successes separately.
          done.fail();
        }, () => {
          expect(!fs.pathExistsSync('foo'));
        });
      })
      .then(done, done.fail);
  });

  it('ng new without skip-git flag creates .git dir', (done) => {
    // Tests ng command output.
    return ng(['new', 'foo', '--skip-install']).then(() => {
      // Checks for Git existence.
      expect(fs.pathExistsSync('.git'));
    })
    .then(done, done.fail);
  });

  it('ng new with --dry-run does not create new directory', (done) => {
    // Tests ng command with --dry-run option.
    return ng(['new', 'foo', '--dry-run']).then(() => {
      // Validates dry run results.
      const cwd = process.cwd();
      expect(cwd).not.toMatch(/foo/, 'does not change cwd to foo in a dry run');
      expect(fs.pathExistsSync(path.join(cwd, 'foo'))).toBe(false, 'does not create new directory');
      expect(fs.pathExistsSync(path.join(cwd, '.git'))).toBe(false, 'does not create git in current directory');
    })
    .then(done, done.fail);
  });

  it('ng new with --directory uses given directory name and has correct package name', (done) => {
    // Tests an Angular project creation command.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--directory=bar'])
      .then(() => {
        // Verifies setup after command execution.
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
    // Creates an Angular application with inline templates and verifies no template file
    // is generated.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--inline-template'])
      .then(() => {
        // Verifies file existence.
        const templateFile = path.join('src', 'app', 'app.component.html');
        expect(fs.pathExistsSync(templateFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('ng new --inline-style does not gener a style file', (done) => {
    // Tests if "ng new" command generates a style file when --inline-style flag is used.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--inline-style'])
      .then(() => {
        // Checks for file existence.
        const styleFile = path.join('src', 'app', 'app.component.css');
        expect(fs.pathExistsSync(styleFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('should skip spec files when passed --skip-tests', (done) => {
    // Tests for skipped spec file creation.
    return ng(['new', 'foo', '--skip-install', '--skip-git', '--skip-tests'])
      .then(() => {
        // Checks for non-existent test file.
        const specFile = path.join('src', 'app', 'app.component.spec.ts');
        expect(fs.pathExistsSync(specFile)).toBe(false);
      })
      .then(done, done.fail);
  });

  it('should specify a version of the CLI', (done) => {
    // Tests CLI versioning.
    return ng(['new', 'FooApp', '--skip-install', '--skip-git']).then(() => {
      // Parses package JSON and tests CLI version.
      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkgJson.devDependencies['@angular/cli']).toMatch(/\d+\.\d+\.\d+/);
    })
    .then(done, done.fail);
  });

  it('should support passing a custom collection', (done) => {
    // Tests a custom Angular CLI command.
    return ng(['new', 'foo', '--collection=@custom/application', '--skip-install', '--skip-git']).then(() => {
      // Checks for expected error.
      expect(() => fs.readFileSync('emptyapp', 'utf8')).not.toThrow();
    })
    .then(done, done.fail);
  });
});
