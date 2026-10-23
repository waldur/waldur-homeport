import { describe, expect, it } from 'vitest';
import { OpenStackInstance } from 'waldur-js-client';

import {
  buildServerGroupLegend,
  formatRam,
} from './HypervisorPlacementMapUtils';

describe('formatRam', () => {
  it('converts 1024 MiB to 1 GB', () => {
    expect(formatRam(1024)).toBe('1 GB');
  });

  it('converts 8192 MiB to 8 GB', () => {
    expect(formatRam(8192)).toBe('8 GB');
  });

  it('converts non-integer GB with one decimal', () => {
    expect(formatRam(1536)).toBe('1.5 GB');
  });

  it('shows MB for values below 1024', () => {
    expect(formatRam(512)).toBe('512 MB');
  });
});

const makeInstance = (overrides: Partial<OpenStackInstance> = {}) =>
  ({
    uuid: 'aaaa-bbbb-cccc',
    name: 'test-vm',
    cores: 4,
    ram: 8192,
    hypervisor_hostname: 'hv-node-01',
    ...overrides,
  }) as any;

describe('buildServerGroupLegend', () => {
  it('returns empty array when no server groups', () => {
    const instances = [makeInstance({ server_group: undefined })];
    expect(buildServerGroupLegend(instances)).toEqual([]);
  });

  it('counts members per server group', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        server_group: { name: 'sg-1', policy: 'affinity' } as any,
      }),
      makeInstance({
        uuid: 'a2',
        server_group: { name: 'sg-1', policy: 'affinity' } as any,
      }),
      makeInstance({
        uuid: 'a3',
        server_group: { name: 'sg-2', policy: 'anti-affinity' } as any,
      }),
    ];
    const legend = buildServerGroupLegend(instances);
    expect(legend).toHaveLength(2);
    expect(legend).toEqual([
      { name: 'sg-1', policy: 'affinity', memberCount: 2 },
      { name: 'sg-2', policy: 'anti-affinity', memberCount: 1 },
    ]);
  });

  it('sorts server groups alphabetically by name', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        server_group: { name: 'zulu', policy: 'affinity' } as any,
      }),
      makeInstance({
        uuid: 'a2',
        server_group: { name: 'alpha', policy: 'affinity' } as any,
      }),
    ];
    const legend = buildServerGroupLegend(instances);
    expect(legend[0].name).toBe('alpha');
    expect(legend[1].name).toBe('zulu');
  });

  it('uses ? for missing policy', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        server_group: { name: 'sg-1' } as any,
      }),
    ];
    const legend = buildServerGroupLegend(instances);
    expect(legend[0].policy).toBe('?');
  });

  it('skips instances with no server group name', () => {
    const instances = [
      makeInstance({ uuid: 'a1', server_group: undefined }),
      makeInstance({ uuid: 'a2', server_group: { name: '' } as any }),
      makeInstance({
        uuid: 'a3',
        server_group: { name: 'real-sg', policy: 'affinity' } as any,
      }),
    ];
    const legend = buildServerGroupLegend(instances);
    expect(legend).toHaveLength(1);
    expect(legend[0].name).toBe('real-sg');
  });
});
