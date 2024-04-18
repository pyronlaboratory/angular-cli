/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-implicit-dependencies
import { tags, terminal } from '@angular-devkit/core';
import * as glob from 'glob';
import 'jasmine';
import { SpecReporter as JasmineSpecReporter } from 'jasmine-spec-reporter';
import { join, relative } from 'path';


const Jasmine = require('jasmine');

const projectBaseDir = join(__dirname, '../packages');
require('source-map-support').install({
  hookRequire: true,
});


declare const global: {
  benchmarkReporter: {};
};


interface BenchmarkResult {
  slowest: number[];
  fastest: number[];
  mean: number;
  average: number;

  base?: BenchmarkResult;
}


class BenchmarkReporter extends JasmineSpecReporter implements jasmine.CustomReporter {
  private _stats: BenchmarkResult | null;

  /**
   * @description initializes a class by passing an object containing various properties,
   * including a summary object.
   */
  constructor() {
    super({
      summary: {},
    });
  }

  /**
   * @description sets the instance variable `stats` to a `BenchmarkResult`.
   * 
   * @param { BenchmarkResult } stats - benchmark result that will be stored in the
   * internal state of the `ReportBenchmark` class.
   */
  reportBenchmark(stats: BenchmarkResult) {
    this._stats = stats;
  }

  /**
   * @description initializes Jasmine runners for the given test suite information.
   * 
   * @param { jasmine.SuiteInfo } suiteInfo - information about the Jasmine suite, which
   * includes its name and other metadata.
   */
  jasmineStarted(suiteInfo: jasmine.SuiteInfo): void {
    super.jasmineStarted(suiteInfo);
  }
  /**
   * @description notifies the framework that a new test suite has started running,
   * providing the result of the event through the `result` parameter.
   * 
   * @param { jasmine.CustomReporterResult } result - output of the `jasmine.CustomReporterResult`
   * constructor, which provides information about the current test run.
   */
  suiteStarted(result: jasmine.CustomReporterResult): void {
    super.suiteStarted(result);
  }
  /**
   * @description disposes of previously collected stats when a Jasmine test run finishes.
   * 
   * @param { jasmine.CustomReporterResult } result - outcome of running a Jasmine spec
   * test, which is passed as an object to the `specStarted()` function for further
   * processing and storage in the `stats` property.
   */
  specStarted(result: jasmine.CustomReporterResult): void {
    super.specStarted(result);
    this._stats = null;
  }
  /**
   * @description updates the console with timing metrics for the Jasmine test runs,
   * including fastest and slowest times, mean and average speeds, and a base metric
   * for comparing to the original speed of the application.
   * 
   * @param { jasmine.CustomReporterResult } result - result of running the spec, and
   * it is passed to the `super.specDone(result)` method as a paramater, which handles
   * any additional processing or logging that needs to be done after the spec has run.
   */
  specDone(result: jasmine.CustomReporterResult): void {
    super.specDone(result);
    if (result.status == 'passed' && this._stats) {
      const stat = this._stats;
      const padding = '             ';

      /**
       * @description replaces a value with spaces on the right-hand side to make it a fixed
       * length by removing excess characters on the right-hand side when provided a string
       * or number as input and a desired padding character.
       * 
       * @param { string | number } x - string or number that is to be padded.
       * 
       * @param { string } p - padding string to be appended to the left of the transformed
       * output of the `x` input parameter.
       * 
       * @returns { string } a padded string of a given length and padding character.
       */
      function pad(x: string | number, p: string = padding): string {
        const s = ('' + x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return p.substr(0, p.length - ('' + s).length) + s;
      }

      const fastest = stat.fastest.map(x => pad(x)).join('');
      const slowest = stat.slowest.map(x => pad(x)).join('');
      const mean = pad(Math.floor(stat.mean));
      const average = pad(Math.floor(stat.average));
      if (stat.base) {
        const precision = (x: number) => ('' + Math.floor(x * 100)).replace(/(\d\d)$/, '.$1');
        const multPad = '      ';
        const baseFastest = stat.base.fastest.map(x => pad(x)).join('');
        const baseSlowest = stat.base.slowest.map(x => pad(x)).join('');
        const baseMean = pad(Math.floor(stat.base.mean));
        const baseMeanMult = pad(precision(stat.mean / stat.base.mean), multPad);
        const baseAverage = pad(Math.floor(stat.base.average));
        const baseAverageMult = pad(precision(stat.average / stat.base.average), multPad);

        console.log(terminal.colors.yellow(tags.indentBy(6)`
          fastest: ${fastest}
            (base) ${baseFastest}
          slowest: ${slowest}
            (base) ${baseSlowest}
          mean:    ${mean} (${baseMean}) (${baseMeanMult}x)
          average: ${average} (${baseAverage}) (${baseAverageMult}x)
        `));
      } else {
        console.log(terminal.colors.yellow(tags.indentBy(6)`
          fastest: ${fastest}
          slowest: ${slowest}
          mean:    ${mean}
          average: ${average}
        `));
      }
    }
  }
  /**
   * @description is called when a Jasmine test suite finishes running, passing along
   * the result of the run. It simply calls the `super.suiteDone()` method, passing
   * along the result as an argument, to notify any parent listeners of the completion
   * of the test suite.
   * 
   * @param { jasmine.CustomReporterResult } result - result of running the Jasmine
   * test suite, and is passed to the parent `super.suiteDone()` function as its first
   * argument.
   */
  suiteDone(result: jasmine.CustomReporterResult): void {
    super.suiteDone(result);
  }
  /**
   * @description is called upon completion of a Jasmine run. It updates the relevant
   * data structures and prepares for the next run.
   * 
   * @param { jasmine.RunDetails } runDetails - result of the Jasmine test run, and is
   * passed to the `super.jasmineDone()` method for further processing.
   */
  jasmineDone(runDetails: jasmine.RunDetails): void {
    super.jasmineDone(runDetails);
  }
}


// Create a Jasmine runner and configure it.
const runner = new Jasmine({ projectBaseDir: projectBaseDir });

runner.env.clearReporters();
global.benchmarkReporter = new BenchmarkReporter();
runner.env.addReporter(global.benchmarkReporter);


// Manually set exit code (needed with custom reporters)
/**
 * @description sets `process.exitCode` to `0` if a boolean `success` is `true`, and
 * `1` otherwise.
 * 
 * @param { boolean } success - outcome of the operation and assigns an exit code of
 * 0 if the operation was successful or 1 otherwise.
 */
runner.onComplete((success: boolean) => {
  process.exitCode = success ? 0 : 1;
});


// Run the tests.
const allTests =
  glob.sync('packages/**/*_benchmark.ts')
    .map(p => relative(projectBaseDir, p))
    .filter(p => !/schematics_cli\/schematics\//.test(p));


export default function(_args: {}) {
  runner.execute(allTests);
}
