import { generatePassword } from './PasswordField';

describe('Password generator', () => {
  it('generates string with given length', () => {
    const password = generatePassword(10);
    expect(password.length).toBe(10);
    expect(typeof password).toBe('string');
  });
});
