import { describe, expect, it } from 'vitest';

import {
  formatValidationErrors,
  getValidationErrors,
  parseGroupLines,
  toSubmissionErrors,
  validateGroupName,
} from './utils';

const UUID = '0b4a1c2d3e4f5a6b7c8d9e0f1a2b3c4d';

describe('parseGroupLines', () => {
  it('reads project, GID and optional name, skipping header and comments', () => {
    const { groups, lines, errors } = parseGroupLines(
      [
        'project,gid,name',
        '# hand-made groups',
        `${UUID},20001,alpha`,
        '',
        `0b4a1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d; 20002`,
        'climate-models,20003',
      ].join('\n'),
    );

    expect(errors).toEqual([]);
    expect(groups).toEqual([
      { project: UUID, gid: 20001, name: 'alpha' },
      { project: UUID, gid: 20002 },
      { project: 'climate-models', gid: 20003 },
    ]);
    expect(lines).toEqual([3, 5, 6]);
  });

  it('names the line of each problem', () => {
    const { errors } = parseGroupLines(
      [`${UUID},abc`, 'no pe,20001', `${UUID}`, `${UUID},20001,Bad Name`].join(
        '\n',
      ),
    );

    expect(errors).toEqual([
      'Line 1: "abc" is not a GID.',
      'Line 2: "no pe" is neither a project UUID nor a short name.',
      'Line 3: expected the project’s UUID or short name, the GID and an optional group name.',
      expect.stringMatching(/^Line 4: Use 1–32 lowercase letters/),
    ]);
  });
});

describe('validateGroupName', () => {
  it('follows the POSIX group name rule', () => {
    expect(validateGroupName('my-project_1')).toBeUndefined();
    expect(validateGroupName('')).toBeUndefined();
    expect(validateGroupName('1project')).toBeDefined();
    expect(validateGroupName('a'.repeat(33))).toBeDefined();
  });
});

describe('formatValidationErrors', () => {
  it('numbers the refused groups by the line they were pasted on', () => {
    expect(
      formatValidationErrors(
        { groups: { 1: { gid: ['GID 20002 is held by another consumer.'] } } },
        [3, 5],
      ),
    ).toEqual(['Line 5, GID: GID 20002 is held by another consumer.']);
  });

  it('reads per-entry errors given as a list', () => {
    expect(
      formatValidationErrors({ groups: [{}, { project: ['Not found.'] }] }),
    ).toEqual(['Line 2, Project: Not found.']);
  });

  it('keeps general messages unprefixed', () => {
    expect(
      formatValidationErrors({
        non_field_errors: ['The provider has no pool.'],
        gid: ['Outside the range.'],
      }),
    ).toEqual(['The provider has no pool.', 'GID: Outside the range.']);
  });
});

describe('getValidationErrors', () => {
  it('returns the body of a 400 response only', () => {
    expect(
      getValidationErrors({ response: { status: 400 }, gid: ['Taken.'] }),
    ).toEqual({ gid: ['Taken.'] });
    expect(getValidationErrors({ response: { status: 500 } })).toBeNull();
  });

  it('drops the transport fields next to the body', () => {
    expect(
      getValidationErrors({
        response: { status: 400 },
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost/api/x/',
        groups: { 0: { gid: ['Taken.'] } },
      }),
    ).toEqual({ groups: { 0: { gid: ['Taken.'] } } });
  });
});

describe('parseGroupLines project references', () => {
  it('reads only UUID shapes as UUIDs and the rest as Django slugs', () => {
    const { groups, errors } = parseGroupLines(
      [
        '0B4A1C2D3E4F5A6B7C8D9E0F1A2B3C4D,20001',
        '_legacy-lab,20002',
        'cafe,20003',
        'my.project,20004',
      ].join('\n'),
    );

    expect(groups.map((group) => group.project)).toEqual([
      '0b4a1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      '_legacy-lab',
      'cafe',
    ]);
    expect(errors).toEqual([
      'Line 4: "my.project" is neither a project UUID nor a short name.',
    ]);
  });
});

describe('messages in UI terms', () => {
  const backend =
    "25000 is outside the pool's project group range [20001-20200]. Set allow_outside_range to use it anyway.";
  const shown =
    "25000 is outside the pool's project group range [20001-20200]. Select “Allow a GID outside the project group range” to use it anyway.";

  it('names the option instead of the API field, under the field', () => {
    expect(toSubmissionErrors({ gid: [backend] }, ['gid']).gid).toEqual([
      shown,
    ]);
  });

  it('names the option in an import refusal', () => {
    expect(
      formatValidationErrors({ groups: { 0: { gid: [backend] } } }),
    ).toEqual([`Line 1, GID: ${shown}`]);
  });
});
