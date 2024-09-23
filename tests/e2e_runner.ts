// This may seem awkward but we're using Logger in our e2e. At this point the unit tests
// have run already so it should be "safe", teehee.
import {
  ConsoleLoggerStack,
  LogEntry,
  IndentLogger,
  NullLogger
} from '../packages/@ngtools/logger/src/index';
import {blue, bold, green, red, yellow, white} from 'chalk';
import {gitClean} from './e2e/utils/git';
import * as glob from 'glob';
import * as minimist from 'minimist';
import * as path from 'path';
import {setGlobalVariable} from './e2e/utils/env';

// RxJS
import {filter} from 'rxjs/operators';


Error.stackTraceLimit = Infinity;


/**
 * Here's a short description of those flags:
 *   --debug          If a test fails, block the thread so the temporary directory isn't deleted.
 *   --noproject      Skip creating a project or using one.
 *   --nobuild        Skip building the packages. Use with --noglobal and --reuse to quickly
 *                    rerun tests.
 *   --noglobal       Skip linking your local @angular/cli directory. Can save a few seconds.
 *   --nosilent       Never silence ng commands.
 *   --ng-sha=SHA     Use a specific ng-sha. Similar to nightly but point to a master SHA instead
 *                    of using the latest.
 *   --glob           Run tests matching this glob pattern (relative to tests/e2e/).
 *   --ignore         Ignore tests matching this glob pattern.
 *   --nightly        Install angular nightly builds over the test project.
 *   --reuse=/path    Use a path instead of create a new project. That project should have been
 *                    created, and npm installed. Ideally you want a project created by a previous
 *                    run of e2e.
 *   --nb-shards      Total number of shards that this is part of. Default is 2 if --shard is
 *                    passed in.
 *   --shard          Index of this processes' shard.
 *   --devkit=path    Path to the devkit to use. The devkit will be built prior to running.
 *   --tmpdir=path    Override temporary directory to use for new projects.
 * If unnamed flags are passed in, the list of tests will be filtered to include only those passed.
 */
const argv = minimist(process.argv.slice(2), {
  'boolean': [
    'appveyor',
    'debug',
    'eject',
    'nightly',
    'noglobal',
    'nosilent',
    'noproject',
    'verbose',
  ],
  'string': ['devkit', 'glob', 'ignore', 'reuse', 'ng-sha', 'tmpdir'],
  'number': ['nb-shards', 'shard']
});


/**
 * Set the error code of the process to 255.  This is to ensure that if something forces node
 * to exit without finishing properly, the error code will be 255. Right now that code is not used.
 *
 * When tests succeed we already call `process.exit(0)`, so this doesn't change any correct
 * behaviour.
 *
 * One such case that would force node <= v6 to exit with code 0, is a Promise that doesn't resolve.
 */
process.exitCode = 255;


ConsoleLoggerStack.start(new IndentLogger('name'))
  .pipe(filter((entry: LogEntry) => (entry.level != 'debug' || argv.verbose)))
  .subscribe((entry: LogEntry) => {
    // Formats log entries for display.
    let color: (s: string) => string = white;
    let output = process.stdout;
    switch (entry.level) {
      case 'info': color = white; break;
      case 'warn': color = yellow; break;
      case 'error': color = red; output = process.stderr; break;
      case 'fatal': color = (x: string) => bold(red(x)); output = process.stderr; break;
    }

    output.write(color(entry.message) + '\n');
  });

const testGlob = argv.glob || 'tests/**/*.ts';
let currentFileName = null;

const e2eRoot = path.join(__dirname, 'e2e');
const allSetups = glob.sync(path.join(e2eRoot, 'setup/**/*.ts'), { nodir: true })
  .map(name => path.relative(e2eRoot, name))
  .sort();
const allTests = glob.sync(path.join(e2eRoot, testGlob), { nodir: true, ignore: argv.ignore })
  .map(name => path.relative(e2eRoot, name))
  .sort();

const shardId = ('shard' in argv) ? argv['shard'] : null;
const nbShards = (shardId === null ? 1 : argv['nb-shards']) || 2;
const tests = allTests
  .filter(name => {
    // Check for naming tests on command line.
    if (argv._.length == 0) {
      return true;
    }

    return argv._.some(argName => {
      // Checks if an argument matches a file path or name.
      return path.join(process.cwd(), argName) == path.join(__dirname, 'e2e', name)
        || argName == name
        || argName == name.replace(/\.ts$/, '');
    });
  });

// Remove tests that are not part of this shard.
const shardedTests = tests
  .filter((name, i) => (shardId === null || (i % nbShards) == shardId));
const testsToRun = allSetups.concat(shardedTests);


/**
 * Load all the files from the e2e, filter and sort them and build a promise of their default
 * export.
 */
if (testsToRun.length == allTests.length) {
  console.log(`Running ${testsToRun.length} tests`);
} else {
  console.log(`Running ${testsToRun.length} tests (${allTests.length + allSetups.length} total)`);
}

setGlobalVariable('argv', argv);

testsToRun.reduce((previous, relativeName, testIndex) => {
  // Make sure this is a windows compatible path.
  let absoluteName = path.join(e2eRoot, relativeName);
  if (/^win/.test(process.platform)) {
    absoluteName = absoluteName.replace(/\\/g, path.posix.sep);
  }

  return previous.then(() => {
    // Runs tests.
    currentFileName = relativeName.replace(/\.ts$/, '');
    const start = +new Date();

    const module = require(absoluteName);
    const fn: (...args: any[]) => Promise<any> | any =
      (typeof module == 'function') ? module
      : (typeof module.default == 'function') ? module.default
      : () => { throw new Error('Invalid test module.'); };

    let clean = true;
    let previousDir = null;
    return Promise.resolve()
      .then(() => printHeader(currentFileName, testIndex))
      .then(() => previousDir = process.cwd())
      .then(() => ConsoleLoggerStack.push(currentFileName))
      .then(() => fn(() => clean = false))
      .then(() => ConsoleLoggerStack.pop(), (err: any) => { ConsoleLoggerStack.pop(); throw err; })
      .then(() => console.log('----'))
      .then(() => {
        // If we're not in a setup, change the directory back to where it was before the test.
        // This allows tests to chdir without worrying about keeping the original directory.
        if (allSetups.indexOf(relativeName) == -1 && previousDir) {
          process.chdir(previousDir);
        }
      })
      .then(() => {
        // Only clean after a real test, not a setup step. Also skip cleaning if the test
        // requested an exception.
        if (allSetups.indexOf(relativeName) == -1 && clean) {
          ConsoleLoggerStack.push(NullLogger);
          return gitClean()
            .then(() => ConsoleLoggerStack.pop(), (err: any) => {
              ConsoleLoggerStack.pop();
              throw err;
            });
        }
      })
      .then(() => printFooter(currentFileName, start),
        (err) => {
          printFooter(currentFileName, start);
          console.error(err);
          throw err;
        });
  });
}, Promise.resolve())
  .then(() => {
      // Handles test completion or failure.
      console.log(green('Done.'));
      process.exit(0);
    },
    (err) => {
      console.log('\n');
      console.error(red(`Test "${currentFileName}" failed...`));
      console.error(red(err.message));
      console.error(red(err.stack));

      if (argv.debug) {
        console.log(`Current Directory: ${process.cwd()}`);
        console.log('Will loop forever while you debug... CTRL-C to quit.');

        /* eslint-disable no-constant-condition */
        while (1) {
          // That's right!
        }
      }

      process.exit(1);
    });


/**
 * @description Normalizes a given string by replacing non-alphabetic characters with
 * '-', replacing forward slashes with '.', and removing trailing '-'. The regular
 * expressions used for replacement ensure that these operations are performed globally
 * within the string.
 *
 * @param {string} str - Input to be encoded.
 *
 * @returns {string} The input string with non-alphabetic characters replaced by
 * hyphens and forward slashes replaced by periods, followed by a hyphen removed if
 * present at the end.
 */
function encode(str) {
  return str.replace(/[^A-Za-z\d\/]+/g, '-').replace(/\//g, '.').replace(/[\/-]$/, '');
}

/**
 * @description Returns a boolean value indicating whether a Travis CI environment
 * variable 'TRAVIS' exists in the current process's environment variables.
 *
 * @returns {boolean} True if environment variable 'TRAVIS' exists and false otherwise.
 */
function isTravis() {
  return process.env['TRAVIS'];
}

/**
 * @description Prints a header to the console indicating the test being run, its
 * index, and additional information such as shard ID if applicable. It also logs a
 * fold start event for Travis CI integration.
 *
 * @param {string} testName - Used to display test name in console output.
 *
 * @param {number} testIndex - Used to track test progress.
 */
function printHeader(testName: string, testIndex: number) {
  const text = `${testIndex + 1} of ${testsToRun.length}`;
  const fullIndex = (testIndex < allSetups.length ? testIndex
      : (testIndex - allSetups.length) * nbShards + shardId + allSetups.length) + 1;
  const length = tests.length + allSetups.length;
  const shard = shardId === null ? ''
      : yellow(` [${shardId}:${nbShards}]` + bold(` (${fullIndex}/${length})`));
  console.log(green(`Running "${bold(blue(testName))}" (${bold(white(text))}${shard})...`));

  if (isTravis()) {
    console.log(`travis_fold:start:${encode(testName)}`);
  }
}

/**
 * @description Logs a message to the console, indicating the time taken for a test
 * or task. It takes into account Travis CI environment and formats the output with
 * color codes to highlight the duration.
 *
 * @param {string} testName - Used for logging purposes.
 *
 * @param {number} startTime - Referenced as an argument to `Date.now()` to record
 * when a test started.
 */
function printFooter(testName, startTime) {
  if (isTravis()) {
    console.log(`travis_fold:end:${encode(testName)}`);
  }

  // Round to hundredth of a second.
  const t = Math.round((Date.now() - startTime) / 10) / 100;
  console.log(green('Last step took ') + bold(blue(t)) + green('s...'));
  console.log('');
}
