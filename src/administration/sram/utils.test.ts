import { FORM_ERROR } from 'final-form';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROJECT_PATTERN,
  getRuleInitialValues,
  renderProjectPattern,
  serializeRule,
  toSubmitErrors,
  validateGroupPatterns,
  validateProjectPattern,
} from './utils';

const rule = {
  url: 'http://example.com/api/sram-project-rules/r1/',
  uuid: 'r1',
  name: 'Research workspaces',
  is_active: false,
  source_kind: 'group',
  labels: ['tag_ufra'],
  group_short_name_patterns: ['compute-*'],
  project_field: 'slug',
  project_match: 'exact',
  project_pattern: '{co_short_name}-{group_short_name}',
  project_role: 'role-uuid',
  project_role_name: 'PROJECT.MEMBER',
  project_role_description: 'Project member',
  created: '',
  modified: '',
} as any;

describe('validateGroupPatterns', () => {
  it('hints that patterns need a group source', () => {
    expect(validateGroupPatterns(['compute-*'], { source_kind: 'co' })).toMatch(
      /apply only to groups/,
    );
  });

  it('accepts patterns for group and any sources', () => {
    expect(
      validateGroupPatterns(['compute-*'], { source_kind: 'group' }),
    ).toBeUndefined();
    expect(
      validateGroupPatterns(['compute-*'], { source_kind: 'any' }),
    ).toBeUndefined();
  });

  it('accepts no patterns for any source', () => {
    expect(validateGroupPatterns([], { source_kind: 'co' })).toBeUndefined();
    expect(
      validateGroupPatterns(undefined, { source_kind: 'co' }),
    ).toBeUndefined();
  });
});

describe('validateProjectPattern', () => {
  it('accepts the default and every known placeholder', () => {
    expect(validateProjectPattern(DEFAULT_PROJECT_PATTERN)).toBeUndefined();
    expect(
      validateProjectPattern(
        '{co_external_id}{co_identifier}{co_short_name}{org_short_name}{group_short_name}',
      ),
    ).toBeUndefined();
  });

  it('requires a pattern', () => {
    expect(validateProjectPattern('')).toMatch(/required/);
  });

  it('rejects an unknown placeholder, naming it', () => {
    expect(validateProjectPattern('{co_name}_')).toMatch(/\{co_name\}/);
  });

  it('rejects unbalanced braces the way str.format does', () => {
    expect(validateProjectPattern('{co_short_name')).toMatch(/unclosed/);
    expect(validateProjectPattern('abc}')).toMatch(/single/);
  });

  it('treats doubled braces as literals', () => {
    expect(renderProjectPattern('a{{2}}{co_short_name}')).toEqual({
      rendered: 'a{2}x',
    });
    expect(
      validateProjectPattern('^x{{2,3}}$', { project_match: 'regex' }),
    ).toBeUndefined();
  });

  it('checks the regular expression only in regex mode', () => {
    expect(
      validateProjectPattern('{co_short_name}(', { project_match: 'regex' }),
    ).toMatch(/regular expression/);
    expect(
      validateProjectPattern('{co_short_name}(', { project_match: 'prefix' }),
    ).toBeUndefined();
  });
});

describe('getRuleInitialValues', () => {
  it('defaults a new rule the way the backend does', () => {
    expect(getRuleInitialValues()).toEqual(
      expect.objectContaining({
        is_active: true,
        source_kind: 'co',
        project_field: 'backend_id',
        project_match: 'prefix',
        project_pattern: '{co_external_id}_',
        labels: [],
        group_short_name_patterns: [],
      }),
    );
  });

  it('copies an edited rule', () => {
    expect(getRuleInitialValues(rule)).toEqual({
      name: 'Research workspaces',
      is_active: false,
      source_kind: 'group',
      labels: ['tag_ufra'],
      group_short_name_patterns: ['compute-*'],
      project_field: 'slug',
      project_match: 'exact',
      project_pattern: '{co_short_name}-{group_short_name}',
      project_role: 'role-uuid',
    });
  });

  it('renames a duplicated rule', () => {
    expect(getRuleInitialValues(rule, true).name).toBe(
      'Research workspaces (copy)',
    );
  });

  it('drops list entries that are not strings', () => {
    expect(getRuleInitialValues({ ...rule, labels: { a: 1 } }).labels).toEqual(
      [],
    );
  });
});

describe('serializeRule', () => {
  it('sends lists as trimmed string arrays and the role by uuid', () => {
    expect(
      serializeRule({
        ...getRuleInitialValues(rule),
        name: ' Research ',
        labels: [' tag_ufra ', ''],
      }),
    ).toEqual({
      name: 'Research',
      is_active: false,
      source_kind: 'group',
      labels: ['tag_ufra'],
      group_short_name_patterns: ['compute-*'],
      project_field: 'slug',
      project_match: 'exact',
      project_pattern: '{co_short_name}-{group_short_name}',
      project_role: 'role-uuid',
    });
  });
});

describe('toSubmitErrors', () => {
  it('keys field errors by field and the rest under FORM_ERROR', () => {
    expect(
      toSubmitErrors({
        group_short_name_patterns: [
          'Group short names only apply to groups; set source_kind to group or any.',
        ],
        non_field_errors: ['Something else.'],
      }),
    ).toEqual({
      group_short_name_patterns:
        'Group short names only apply to groups; set source_kind to group or any.',
      [FORM_ERROR]: 'Something else.',
    });
  });

  it('returns nothing without a body', () => {
    expect(toSubmitErrors(undefined)).toBeUndefined();
  });
});
