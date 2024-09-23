import { ng, setupProject } from '../helpers';

describe('Acceptance: ng destroy', () => {
  // Tests ng destroy command failures.
  setupProject();

  it('without args should fail', (done) => {
    // Tests the failure of an Angular CLI command without arguments.
    return ng(['destroy'])
      .then(() => done.fail())
      .catch(error => {
        // Handles errors.
        expect(error.message).toBe('The destroy command is not supported by Angular CLI.');
        done();
      });
  });

  it('with args should fail', (done) => {
    // Fails an assertion on an Angular CLI command.
    return ng(['destroy', 'something'])
      .then(() => done.fail())
      .catch(error => {
        // Handles errors.
        expect(error.message).toBe('The destroy command is not supported by Angular CLI.');
        done();
      });
  });
});
