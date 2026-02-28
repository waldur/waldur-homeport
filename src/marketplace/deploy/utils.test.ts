import { describe, expect, it } from 'vitest';

import { generateSystemImageChoices } from './utils';

const img = (name: string) => ({ name, uuid: name });

describe('generateSystemImageChoices', () => {
  it('returns empty array for empty input', () => {
    expect(generateSystemImageChoices([])).toEqual([]);
    expect(generateSystemImageChoices(null as any)).toEqual([]);
    expect(generateSystemImageChoices(undefined as any)).toEqual([]);
  });

  describe('known images', () => {
    it('groups Ubuntu versions together', () => {
      const choices = generateSystemImageChoices([
        img('Ubuntu 22.04 x86_64'),
        img('Ubuntu 24.04 x86_64'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Ubuntu');
      expect(choices[0].options).toHaveLength(2);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining(['24.04 x86_64', '22.04 x86_64']),
      );
    });

    it('groups Debian versions together', () => {
      const choices = generateSystemImageChoices([
        img('Debian 11 x86_64'),
        img('Debian 12 x86_64'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Debian');
      expect(choices[0].options).toHaveLength(2);
    });

    it('groups Windows Server versions together', () => {
      const choices = generateSystemImageChoices([
        img('Windows Server 2022 Standard x86_64'),
        img('Windows Server 2025 Standard x86_64'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Windows Server');
      expect(choices[0].options).toHaveLength(2);
    });

    it('groups AlmaLinux versions together', () => {
      const choices = generateSystemImageChoices([
        img('AlmaLinux 8 x86_64'),
        img('AlmaLinux 9 x86_64'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('AlmaLinux');
      expect(choices[0].options).toHaveLength(2);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining(['8 x86_64', '9 x86_64']),
      );
    });

    it('groups RockyLinux versions together under RockyLinux', () => {
      const choices = generateSystemImageChoices([
        img('RockyLinux 8 x86_64'),
        img('RockyLinux 9 x86_64'),
        img('RockyLinux 10 LVM x86_64'),
        img('RockyLinux 10 x86_64'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('RockyLinux');
      expect(choices[0].options).toHaveLength(4);
    });

    it('groups Mikrotik versions together', () => {
      const choices = generateSystemImageChoices([
        img('Mikrotik v6-LTS-i440fx'),
        img('Mikrotik v7'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Mikrotik');
      expect(choices[0].options).toHaveLength(2);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining(['v6-LTS-i440fx', 'v7']),
      );
    });

    it('groups sophos versions together', () => {
      const choices = generateSystemImageChoices([
        img('sophos 21-auxiliary-disk'),
        img('sophos 21-primary-disk'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Sophos');
      expect(choices[0].options).toHaveLength(2);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining(['21-auxiliary-disk', '21-primary-disk']),
      );
    });

    it('groups VyOS versions together', () => {
      const choices = generateSystemImageChoices([
        img('vyos-1.4.3-openstack'),
        img('vyos-1.5-openstack'),
        img('vyos-2025-rolling-cloud'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('VyOS');
      expect(choices[0].options).toHaveLength(3);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining([
          '1.4.3-openstack',
          '1.5-openstack',
          '2025-rolling-cloud',
        ]),
      );
    });

    it('extracts Fortinet product versions correctly', () => {
      const choices = generateSystemImageChoices([
        img('FortiAnalyzer-7-6-2'),
        img('FortiAuthenticator-6-6-3'),
        img('FortiManager-7-6-2'),
        img('Fortinet-v7.4.7.M-build2731'),
      ]);
      expect(choices).toHaveLength(4);
      const labels = choices.map((c) => c.label);
      expect(labels).toContain('FortiAnalyzer');
      expect(labels).toContain('FortiAuthenticator');
      expect(labels).toContain('FortiManager');
      expect(labels).toContain('Fortinet');
    });

    it('extracts openSUSE version correctly', () => {
      const choices = generateSystemImageChoices([img('openSUSE MicroOS')]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('openSUSE');
      expect(choices[0].options[0].label).toBe('MicroOS');
    });

    it('preserves v-prefix in version strings', () => {
      const choices = generateSystemImageChoices([img('Mikrotik v7')]);
      expect(choices[0].options[0].label).toBe('v7');
    });

    it('does not produce image element when thumb is null', () => {
      const choices = generateSystemImageChoices([img('AlmaLinux 9 x86_64')]);
      expect(choices[0].image).toBeUndefined();
    });

    it('produces image element for known images with thumb', () => {
      const choices = generateSystemImageChoices([img('Ubuntu 24.04 x86_64')]);
      expect(choices[0].image).toBeDefined();
    });
  });

  describe('unknown images', () => {
    it('groups unknown images with the same base name', () => {
      const choices = generateSystemImageChoices([
        img('CustomOS-1.0'),
        img('CustomOS-2.0'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('CustomOS');
      expect(choices[0].options).toHaveLength(2);
      expect(choices[0].options.map((o) => o.label)).toEqual(
        expect.arrayContaining(['1.0', '2.0']),
      );
    });

    it('splits name from version at digit boundary', () => {
      const choices = generateSystemImageChoices([
        img('Cisco-Secure-FW-Mgmt-Center-7.4.2-172'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Cisco-Secure-FW-Mgmt-Center');
      expect(choices[0].options[0].label).toBe('7.4.2-172');
    });

    it('handles names with spaces before version', () => {
      const choices = generateSystemImageChoices([
        img('Github-Enterprise 3.16.0'),
      ]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('Github-Enterprise');
      expect(choices[0].options[0].label).toBe('3.16.0');
    });

    it('handles names without version number', () => {
      const choices = generateSystemImageChoices([img('migrate-linux-dummy')]);
      expect(choices).toHaveLength(1);
      expect(choices[0].label).toBe('migrate-linux-dummy');
      // When no version, option label falls back to the full name
      expect(choices[0].options[0].label).toBe('migrate-linux-dummy');
    });

    it('does not produce trailing dashes or separators in labels', () => {
      const choices = generateSystemImageChoices([img('some-appliance-3.0')]);
      const label = choices[0].label as string;
      expect(label).toBe('some-appliance');
      expect(label.endsWith('-')).toBe(false);
      expect(label.endsWith(' ')).toBe(false);
    });
  });

  describe('mixed known and unknown images', () => {
    it('handles a realistic mix of images', () => {
      const choices = generateSystemImageChoices([
        img('AlmaLinux 8 x86_64'),
        img('AlmaLinux 9 x86_64'),
        img('Debian 11 x86_64'),
        img('Debian 12 x86_64'),
        img('Mikrotik v6-LTS-i440fx'),
        img('Mikrotik v7'),
        img('sophos 21-auxiliary-disk'),
        img('sophos 21-primary-disk'),
        img('vyos-1.4.3-openstack'),
        img('vyos-1.5-openstack'),
        img('Ubuntu 22.04 x86_64'),
        img('Ubuntu 24.04 x86_64'),
        img('Windows Server 2022 Standard x86_64'),
        img('Cisco-Secure-FW-Mgmt-Center-7.4.2-172'),
        img('migrate-linux-dummy'),
      ]);
      const labels = choices.map((c) => c.label);
      expect(labels).toContain('AlmaLinux');
      expect(labels).toContain('Debian');
      expect(labels).toContain('Mikrotik');
      expect(labels).toContain('Sophos');
      expect(labels).toContain('VyOS');
      expect(labels).toContain('Ubuntu');
      expect(labels).toContain('Windows Server');
      expect(labels).toContain('Cisco-Secure-FW-Mgmt-Center');
      expect(labels).toContain('migrate-linux-dummy');

      // Verify grouping counts
      const alma = choices.find((c) => c.label === 'AlmaLinux');
      expect(alma.options).toHaveLength(2);
      const mikrotik = choices.find((c) => c.label === 'Mikrotik');
      expect(mikrotik.options).toHaveLength(2);
      const sophos = choices.find((c) => c.label === 'Sophos');
      expect(sophos.options).toHaveLength(2);
      const vyos = choices.find((c) => c.label === 'VyOS');
      expect(vyos.options).toHaveLength(2);
    });
  });
});
