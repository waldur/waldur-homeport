import { describe, it, expect } from 'vitest';

import { BaseResource } from '@/resource/types';

import { validateState, validateRuntimeState } from './base';

const resource: BaseResource = {
  name: 'VM',
  uuid: 'uuid',
  project_uuid: 'project_uuid',
  state: 'ERRED',
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
    expect(validateState('CREATING', 'UPDATING')(ctx)).toBe(
      'Valid states for operation: CREATING, UPDATING.',
    );
  });

  it('skips validation if resource is in target state', () => {
    expect(validateState('ERRED')(ctx)).toBeUndefined();
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
