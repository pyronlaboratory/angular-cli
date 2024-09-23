import { ng, setupProject } from '../helpers';

describe('Acceptance: ng destroy', () => {
  // Tests ng cli destroy command functionality.
  setupProject();

  it('without args should fail', (done) => {
    // Tests a failed command execution.
    return ng(['destroy'])
      .then(() => done.fail())
      .catch(error => {
        // Handles errors.
        expect(error.message).toBe('The destroy command is not supported by Angular CLI.');
        done();
      });
  });

  it('with args should fail', (done) => {
    // Tests for errors when running an invalid CLI command.
    return ng(['destroy', 'something'])
      .then(() => done.fail())
      .catch(error => {
        // Expects and asserts error message.
        expect(error.message).toBe('The destroy command is not supported by Angular CLI.');
        done();
      });
  });
});
