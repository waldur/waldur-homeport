import { BaseResource } from '@waldur/resource/types';

import { validateState } from './base';

describe('Base actions', () => {
  const resource: BaseResource = {
    state: 'Erred',
    runtime_state: 'ACTIVE',
  };
  const user = {
    is_support: true,
    is_staff: true,
    url: 'Valid URL',
    uuid: 'Valid UUID',
  };
  const ctx = {resource, user};

  it('validates resource state', () => {
    expect(validateState('OK')(ctx)).toBe('Resource should be OK.');
  });

  it('skips validation if resource is in target state', () => {
    expect(validateState('Erred')(ctx)).toBeUndefined();
  });
});
