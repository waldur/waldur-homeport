import { describe, expect, it } from 'vitest';

import { isVerdictForRow } from './rowVerdicts';

const row = (projectUuid?: string) => ({
  email: 'alice@example.com',
  role_project: {
    role: { uuid: 'member-uuid' },
    project: projectUuid ? { uuid: projectUuid } : undefined,
  },
});

describe('isVerdictForRow', () => {
  const verdict = {
    email: 'alice@example.com',
    roleUuid: 'member-uuid',
    projectUuid: 'p1',
  };

  it('matches the row in the project the verdict was recorded for', () => {
    expect(isVerdictForRow(verdict, row('p1'))).toBe(true);
  });

  it('drops the verdict once the row moves to another project', () => {
    expect(isVerdictForRow(verdict, row('p2'))).toBe(false);
  });

  it('matches on email and role alone for a scope without a project', () => {
    const { projectUuid: _, ...scopeless } = verdict;
    expect(isVerdictForRow(scopeless, row('p2'))).toBe(true);
  });

  it('does not match another role or an empty email', () => {
    expect(
      isVerdictForRow({ ...verdict, roleUuid: 'admin-uuid' }, row('p1')),
    ).toBe(false);
    expect(isVerdictForRow(verdict, { ...row('p1'), email: '' })).toBe(false);
  });
});
