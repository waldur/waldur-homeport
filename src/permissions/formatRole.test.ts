import { beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { formatRole } from './utils';

const proposalManager = {
  name: 'manager',
  description: 'Proposal manager',
  content_type: 'proposal',
  is_active: true,
};

describe('formatRole', () => {
  beforeEach(() => {
    ENV.roles = ENV.roles.filter((r) => r.content_type !== 'proposal');
    ENV.roles.push(proposalManager as any);
  });

  it('returns the description of a cached role', () => {
    expect(formatRole('admin')).toBe('Administrator');
  });

  it('restricts the lookup to the given content type', () => {
    expect(formatRole('manager', 'proposal')).toBe('Proposal manager');
    expect(formatRole('manager', 'project')).toBe('Manager');
  });

  it('falls back to the supplied description, then the raw name', () => {
    expect(formatRole('PROPOSAL.CUSTOM', 'proposal', 'Custom role')).toBe(
      'Custom role',
    );
    expect(formatRole('PROPOSAL.CUSTOM', 'proposal')).toBe('PROPOSAL.CUSTOM');
    expect(formatRole('owner', 'proposal')).toBe('owner');
  });

  it('returns nothing for an empty name', () => {
    expect(formatRole(null)).toBeUndefined();
    expect(formatRole('')).toBeUndefined();
  });
});
