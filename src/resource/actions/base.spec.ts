import { BaseResource } from '@waldur/resource/types';

import { validateState, validateRuntimeState } from './base';

const resource: BaseResource = {
  name: 'VM',
  uuid: 'uuid',
  state: 'Erred',
  runtime_state: 'ACTIVE',
};
const user = {
  is_support: true,
  is_staff: true,
  url: 'Valid URL',
  uuid: 'Valid UUID',
};
const ctx = { resource, user };

describe('Resource state validation', () => {
  it('validates resource state', () => {
    expect(validateState('OK')(ctx)).toBe('Valid states for operation: OK.');
  });

  it('validates resource states list', () => {
    expect(validateState('Creating', 'Updating')(ctx)).toBe(
      'Valid states for operation: Creating, Updating.',
    );
  });

  it('skips validation if resource is in target state', () => {
    expect(validateState('Erred')(ctx)).toBeUndefined();
  });
});

describe('Resource runtime state validation', () => {
  it('validates resource state', () => {
    expect(validateRuntimeState('OK')(ctx)).toBe(
      'Valid runtime states for operation: OK.',
    );
  });

  it('validates resource states list', () => {
    expect(validateRuntimeState('SHUTOFF', 'TERMINATED')(ctx)).toBe(
      'Valid runtime states for operation: SHUTOFF, TERMINATED.',
    );
  });

  it('skips validation if resource is in target state', () => {
    expect(validateRuntimeState('ACTIVE')(ctx)).toBeUndefined();
  });
});
