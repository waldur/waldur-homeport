import { validateOpenstackInstanceName } from './utils';

describe('OpenStack Instance Name Validator', () => {
  it('allows trailing slash', () => {
    expect(validateOpenstackInstanceName('example.com.')).toBe(undefined);
  });

  it('allows single component', () => {
    expect(validateOpenstackInstanceName('example')).toBe(undefined);
  });

  it('does not allow long name', () => {
    const name = 'e'.repeat(64);
    expect(validateOpenstackInstanceName(name)).toBe(
      'Name "{label}" must be 1-63 characters long, each of which can only be alphanumeric or a hyphen'.replace(
        '{label}',
        name,
      ),
    );
  });

  it('does not allow empty component', () => {
    expect(validateOpenstackInstanceName('example..com.')).toEqual(
      'Encountered an empty component',
    );
  });

  it('must not start with a hyphen', () => {
    expect(validateOpenstackInstanceName('example-.com')).toEqual(
      'Name "example-" must not start or end with a hyphen',
    );
  });

  it('must not end with a hyphen', () => {
    expect(validateOpenstackInstanceName('-example.com')).toEqual(
      'Name "-example" must not start or end with a hyphen',
    );
  });

  it('must not contain special symbol', () => {
    expect(validateOpenstackInstanceName('example#"@?.com')).toEqual(
      'Name "example#"@?" must be 1-63 characters long, each of which can only be alphanumeric or a hyphen',
    );
  });

  it('must not be all numeric', () => {
    expect(validateOpenstackInstanceName('aaa.999')).toEqual(
      'TLD "999" must not be all numeric',
    );
  });
});
