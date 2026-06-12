import { describe, expect, it } from 'vitest';
import { OpenStackInstance } from 'waldur-js-client';

import {
  buildServerGroupLegend,
  formatRam,
  generatePlacementDiagram,
  sanitizeId,
  escapeLabel,
} from './HypervisorPlacementMapUtils';

describe('sanitizeId', () => {
  it('strips non-alphanumeric characters', () => {
    expect(sanitizeId('hv-node-01.example.com')).toBe('hvnode01examplecom');
  });

  it('returns empty string for all special chars', () => {
    expect(sanitizeId('---...')).toBe('');
  });

  it('keeps alphanumeric unchanged', () => {
    expect(sanitizeId('abc123')).toBe('abc123');
  });
});

describe('escapeLabel', () => {
  it('replaces dashes and dots with spaces', () => {
    expect(escapeLabel('hypervisor-01.demo')).toBe('hypervisor 01 demo');
  });

  it('removes brackets and parentheses', () => {
    expect(escapeLabel('vm [test] (prod)')).toBe('vm test prod');
  });

  it('removes backslashes', () => {
    expect(escapeLabel('path\\to\\vm')).toBe('path to vm');
  });

  it('removes commas', () => {
    expect(escapeLabel('2 vCPU, 4 GB')).toBe('2 vCPU 4 GB');
  });

  it('collapses multiple spaces', () => {
    expect(escapeLabel('a  -  b')).toBe('a b');
  });

  it('keeps plain alphanumeric text unchanged', () => {
    expect(escapeLabel('myvm01')).toBe('myvm01');
  });

  it('keeps spaces in normal text', () => {
    expect(escapeLabel('my vm 01')).toBe('my vm 01');
  });
});

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

describe('generatePlacementDiagram', () => {
  it('starts with architecture-beta header', () => {
    const result = generatePlacementDiagram([makeInstance()]);
    expect(result).toMatch(/^architecture-beta/);
  });

  it('creates a hypervisor group for each unique hostname', () => {
    const instances = [
      makeInstance({ uuid: 'a1', hypervisor_hostname: 'hv01' }),
      makeInstance({ uuid: 'a2', hypervisor_hostname: 'hv02' }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('group hvhv01(ph:cpu)[hv01]');
    expect(result).toContain('group hvhv02(ph:cpu)[hv02]');
  });

  it('sanitizes hostname labels for architecture-beta syntax', () => {
    const instances = [
      makeInstance({ uuid: 'a1', hypervisor_hostname: 'hypervisor-01.demo' }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('[hypervisor 01 demo]');
  });

  it('sorts hypervisors alphabetically with Unassigned last', () => {
    const instances = [
      makeInstance({ uuid: 'a1', hypervisor_hostname: '' }),
      makeInstance({ uuid: 'a2', hypervisor_hostname: 'alpha' }),
      makeInstance({ uuid: 'a3', hypervisor_hostname: 'beta' }),
    ];
    const result = generatePlacementDiagram(instances);
    const lines = result.split('\n');
    const groupLines = lines.filter((l) => l.trim().startsWith('group hv'));
    expect(groupLines[0]).toContain('alpha');
    expect(groupLines[1]).toContain('beta');
    expect(groupLines[2]).toContain('Unassigned');
  });

  it('uses ph:question icon for Unassigned group', () => {
    const instances = [
      makeInstance({ uuid: 'a1', hypervisor_hostname: undefined }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('(ph:question)[Unassigned]');
  });

  it('treats null and empty string hostname as Unassigned', () => {
    const instances = [
      makeInstance({ uuid: 'a1', hypervisor_hostname: null } as any),
      makeInstance({ uuid: 'a2', hypervisor_hostname: '' }),
      makeInstance({ uuid: 'a3', hypervisor_hostname: '  ' }),
    ];
    const result = generatePlacementDiagram(instances);
    const groupLines = result
      .split('\n')
      .filter((l) => l.trim().startsWith('group hv'));
    expect(groupLines).toHaveLength(1);
    expect(groupLines[0]).toContain('Unassigned');
  });

  it('creates a service line for each instance with sanitized labels', () => {
    const instances = [
      makeInstance({ uuid: 'aaa1', name: 'web-01', cores: 2, ram: 4096 }),
      makeInstance({ uuid: 'bbb2', name: 'db-01', cores: 8, ram: 16384 }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('service vmaaa1(ph:desktop-tower)');
    expect(result).toContain('web 01');
    expect(result).toContain('2 vCPU 4 GB');
    expect(result).toContain('db 01');
    expect(result).toContain('8 vCPU 16 GB');
  });

  it('shows ? for missing cores or ram', () => {
    const instances = [
      makeInstance({ uuid: 'a1', cores: undefined, ram: undefined }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('? vCPU ? RAM');
  });

  it('nests VMs in server group sub-groups when present', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        hypervisor_hostname: 'hv01',
        server_group: { name: 'mysg', policy: 'affinity' } as any,
      }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain(
      'group sgmysghv01(ph:users-three)[mysg affinity] in hvhv01',
    );
    expect(result).toContain('in sgmysghv01');
  });

  it('places VMs without server group directly under hypervisor', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        hypervisor_hostname: 'hv01',
        server_group: undefined,
      }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('in hvhv01');
    expect(result).not.toContain('group sg');
  });

  it('handles same server group spanning multiple hypervisors', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        hypervisor_hostname: 'hv01',
        server_group: { name: 'sharedsg', policy: 'anti-affinity' } as any,
      }),
      makeInstance({
        uuid: 'a2',
        hypervisor_hostname: 'hv02',
        server_group: { name: 'sharedsg', policy: 'anti-affinity' } as any,
      }),
    ];
    const result = generatePlacementDiagram(instances);
    expect(result).toContain('in hvhv01');
    expect(result).toContain('in hvhv02');
    const sgLines = result
      .split('\n')
      .filter((l) => l.trim().startsWith('group sg'));
    expect(sgLines).toHaveLength(2);
  });

  it('produces only alphanumeric and spaces in labels', () => {
    const instances = [
      makeInstance({
        uuid: 'a1',
        name: 'web-01 (production)',
        hypervisor_hostname: 'hv-node.example.com',
      }),
    ];
    const result = generatePlacementDiagram(instances);
    // Extract all label contents between [ and ]
    const labels = [...result.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1]);
    for (const label of labels) {
      expect(label).toMatch(/^[a-zA-Z0-9 ?]+$/);
    }
  });
});

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
