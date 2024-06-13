/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-any
// tslint:disable:no-implicit-dependencies
import { logging } from '@angular-devkit/core';
import * as readline from 'readline';
import validateCommits from '../validate-commits';


const emptySha = '0'.repeat(40);


/**
 * @description Parses input from `readline.createInterface()` and validates commits
 * based on provided local SHA and remote SHA values, exiting with an exit code upon
 * completion.
 * 
 * @param { object } _ - 3rd argument to `createInterface`, which is used to create
 * a ReadLine interface for reading user input.
 * 
 * @param { logging.Logger } logger - logging object to be used for outputting messages
 * related to validation of commits.
 * 
 * @returns { integer } a positive integer indicating the result of validation.
 */
export default function (_: {}, logger: logging.Logger) {
  let validateCommitResult = 0;

  // Work on POSIX and Windows
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', line => {
    const [, localSha, , remoteSha] = line.split(/\s+/);

    if (localSha == emptySha) {
      // Deleted branch.
      return;
    }

    if (remoteSha == emptySha) {
      // New branch.
      validateCommitResult = validateCommits({ base: localSha }, logger);
    } else {
      validateCommitResult = validateCommits({ base: remoteSha, head: localSha }, logger);
    }
  });
  rl.on('end', () => process.exit(validateCommitResult));
}
