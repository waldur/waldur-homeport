// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  selectE2eSuites,
  suitesForPipeline,
} from '../scripts/select-e2e-suites.mjs';

describe('selectE2eSuites', () => {
  it.each([
    [
      ['src/openstack/openstack-instance/actions/HardRebootAction.tsx'],
      'openstack',
    ],
    [['src/vmware/VMwareVirtualMachineSummary.tsx'], 'vmware'],
    [['src/matrix/chat/RoomView.tsx'], 'matrix'],
    [['src/proposals/call-management/CallsList.tsx'], 'calls'],
    [['src/reviewer/ReviewsList.tsx'], 'calls'],
    [
      ['src/openstack/utils.ts', 'src/vmware/utils.ts', 'src/matrix/utils.ts'],
      'matrix openstack vmware',
    ],
  ])('a change confined to %j selects %s', (files, expected) => {
    expect(selectE2eSuites(files)).toBe(expected);
  });

  it.each([
    [['src/marketplace/resources/list/ResourcesList.tsx']],
    [['src/table/Table.tsx', 'src/openstack/utils.ts']],
    [['src/EventsEnums.ts']],
    [['package.json']],
    [['yarn.lock']],
    [['locales/et.json']],
    [['docker/rootfs/etc/nginx/nginx.conf']],
    [['vite.config.ts']],
  ])('a change to shared code or the image (%j) selects all', (files) => {
    expect(selectE2eSuites(files)).toBe('all');
  });

  it.each([
    [['src/openstack/openstack-instance/actions/HardRebootAction.test.tsx']],
    [['src/table/Table.stories.tsx']],
    [['src/test/harness.tsx']],
    [['src/customer/__snapshots__/Details.test.tsx.snap']],
    [['.gitlab-ci.yml', 'docs/tables.md', 'scripts/bundle-budget.mjs']],
    [['']],
  ])('a change no suite exercises (%j) selects none', (files) => {
    expect(selectE2eSuites(files)).toBe('none');
  });
});

describe('suitesForPipeline', () => {
  it('runs every suite outside a merge request', () => {
    expect(suitesForPipeline({}, () => 'src/openstack/utils.ts')).toBe('all');
  });

  it('selects from the merge request diff', () => {
    const env = { CI_MERGE_REQUEST_DIFF_BASE_SHA: 'abc123' };

    expect(suitesForPipeline(env, () => 'src/openstack/utils.ts\n')).toBe(
      'openstack',
    );
  });

  it('runs every suite when the diff cannot be read', () => {
    const env = { CI_MERGE_REQUEST_DIFF_BASE_SHA: 'abc123' };
    const unreadable = () => {
      throw new Error('bad object abc123');
    };

    expect(suitesForPipeline(env, unreadable)).toBe('all');
  });
});
