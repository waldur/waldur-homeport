import { describe, expect, it } from 'vitest';
import { RoleHygieneFinding } from 'waldur-js-client';

import { filterFindings } from './utils';

const finding = (
  overrides: Partial<RoleHygieneFinding> = {},
): RoleHygieneFinding => ({
  check: 'name-not-a-code',
  severity: 'error',
  role_uuid: 'uuid-1',
  role_name: 'Researcher (project member)',
  role_description: 'Researcher',
  scope_type: 'project',
  is_system_role: false,
  message: 'Name is free-form text rather than a SCOPE.CODE machine code.',
  details: {},
  ...overrides,
});

describe('filterFindings', () => {
  const findings = [
    finding(),
    finding({
      check: 'global-custom-role',
      severity: 'warning',
      role_uuid: 'uuid-2',
      role_name: 'PROJECT.REVIEWER',
      role_description: 'Reviewer',
      message: 'Custom role with no organization binding.',
    }),
    finding({
      check: 'label-missing',
      severity: 'info',
      role_uuid: 'uuid-3',
      role_name: 'PROJECT.OBSERVER',
      role_description: '',
      message: 'No description.',
    }),
  ];

  it('returns everything when nothing is selected', () => {
    expect(filterFindings(findings)).toHaveLength(3);
  });

  it('keeps only the selected severity', () => {
    expect(filterFindings(findings, { severity: 'warning' })).toEqual([
      findings[1],
    ]);
  });

  it('matches the search against the role code', () => {
    expect(filterFindings(findings, { query: 'project.reviewer' })).toEqual([
      findings[1],
    ]);
  });

  it('matches the search against the check and its label', () => {
    expect(filterFindings(findings, { query: 'label-missing' })).toEqual([
      findings[2],
    ]);
    expect(filterFindings(findings, { query: 'No description' })).toEqual([
      findings[2],
    ]);
  });

  it('matches the search against the message', () => {
    expect(filterFindings(findings, { query: 'free-form' })).toEqual([
      findings[0],
    ]);
  });

  it('combines severity and search', () => {
    expect(
      filterFindings(findings, { severity: 'error', query: 'reviewer' }),
    ).toEqual([]);
  });

  it('ignores surrounding whitespace in the search', () => {
    expect(filterFindings(findings, { query: '  reviewer  ' })).toEqual([
      findings[1],
    ]);
  });
});
