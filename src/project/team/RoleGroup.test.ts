import { describe, expect, it } from 'vitest';

import { renderRoleType } from './RoleGroup';

describe('renderRoleType', () => {
  it('labels every scope that roles can be offered in', () => {
    expect(renderRoleType('project')).toBe('P');
    expect(renderRoleType('proposal')).toBe('PR');
  });
});
