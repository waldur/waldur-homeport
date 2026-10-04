import { beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { getRoleColor } from './utils';

describe('getRoleColor', () => {
  beforeEach(() => {
    ENV.roles = ENV.roles.filter((r) => r.content_type !== 'proposal');
    ENV.roles.push(
      {
        name: 'PROPOSAL.MANAGER.ACME',
        description: 'Proposal manager',
        content_type: 'proposal',
        template_name: 'PROPOSAL.MANAGER',
        is_active: true,
      } as any,
      {
        name: 'PROPOSAL.REVIEWER.CUSTOM',
        description: 'Custom proposal role',
        content_type: 'proposal',
        template_name: null,
        is_active: true,
      } as any,
    );
  });

  it('colours the proposal administrator like the project administrator', () => {
    expect(getRoleColor('PROPOSAL.ADMIN')).toBe(getRoleColor('PROJECT.ADMIN'));
  });

  it('colours a clone like its built-in template', () => {
    expect(getRoleColor('PROPOSAL.MANAGER.ACME')).toBe(
      getRoleColor('PROPOSAL.MANAGER'),
    );
  });

  it('colours other proposal roles by scope', () => {
    expect(getRoleColor('PROPOSAL.REVIEWER.CUSTOM')).toBe('blue');
  });

  it('keeps unknown roles neutral', () => {
    expect(getRoleColor('UNKNOWN')).toBe('neutral');
    expect(getRoleColor('project_role')).toBe('neutral');
  });
});
