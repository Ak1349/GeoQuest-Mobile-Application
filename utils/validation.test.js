import { validateEmail, validatePassword, validateName, validateEventCode } from './validation';

describe('validateEmail', () => {
  it('rejects an empty email', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('rejects a malformed email', () => {
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
  });

  it('accepts a valid email', () => {
    expect(validateEmail('student@kingston.ac.uk')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('rejects a missing password', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('rejects a password shorter than 6 characters', () => {
    expect(validatePassword('abc12')).toBe('Password must be at least 6 characters.');
  });

  it('accepts a valid password', () => {
    expect(validatePassword('abc123')).toBeNull();
  });
});

describe('validateName', () => {
  it('rejects an empty name', () => {
    expect(validateName('')).toBe('Name is required.');
  });

  it('rejects a single-character name', () => {
    expect(validateName('A')).toBe('Name must be at least 2 characters.');
  });

  it('accepts a valid name', () => {
    expect(validateName('Alex Smith')).toBeNull();
  });
});

describe('validateEventCode', () => {
  it('rejects an empty code', () => {
    expect(validateEventCode('')).toBe('Enter an invite code.');
  });

  it('rejects a code that is too short', () => {
    expect(validateEventCode('AB')).toBe('Invite codes are 4-10 characters.');
  });

  it('accepts a valid code', () => {
    expect(validateEventCode('AB12CD')).toBeNull();
  });
});
