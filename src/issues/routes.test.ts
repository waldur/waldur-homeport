import { describe, expect, it } from 'vitest';

import { states } from './routes';

describe('issues/routes', () => {
  it('declares support-users (the staff users list)', () => {
    const route = states.find((s) => s.name === 'support-users');
    expect(route).toBeDefined();
    expect(route?.url).toBe('users/?role');
    expect(route?.parent).toBe('support-user-management');
  });

  it('declares support-user-manage (the per-user detail page)', () => {
    const route = states.find((s) => s.name === 'support-user-manage');
    expect(route).toBeDefined();
    expect(route?.url).toBe('users/:user_uuid/?tab');
    expect(route?.parent).toBe('support-user-manage-container');
  });

  it('keeps support-user-management abstract and gated under support', () => {
    const parent = states.find((s) => s.name === 'support-user-management');
    expect(parent).toBeDefined();
    expect(parent?.abstract).toBe(true);
    expect(parent?.parent).toBe('support');
  });
});
