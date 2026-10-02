import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SoftwarePackageExpandableRow } from './SoftwarePackageExpandableRow';

describe('SoftwarePackageExpandableRow', () => {
  it('filters versions using target_name and target_subtype', () => {
    const offering = {
      software_catalogs: [
        {
          catalog: { supports_cpu_target_restrictions: true },
          enabled_cpu_family: ['x86_64'],
          enabled_cpu_microarchitectures: ['amd/zen3'],
        },
      ],
    } as any;

    const row = {
      name: 'GROMACS',
      versions: [
        {
          uuid: 'v1',
          version: '2024.1',
          targets: [
            {
              target_name: 'x86_64',
              target_subtype: 'amd/zen3',
            },
          ],
        },
        {
          uuid: 'v2',
          version: '2024.2',
          targets: [
            {
              target_name: 'x86_64',
              target_subtype: 'intel/haswell',
            },
          ],
        },
      ],
    } as any;

    render(<SoftwarePackageExpandableRow row={row} offering={offering} />);

    expect(screen.getByText('2024.1')).toBeInTheDocument();
    expect(screen.queryByText('2024.2')).not.toBeInTheDocument();
  });

  it('shows all versions with targets when CPU restrictions are not configured', () => {
    const offering = {
      software_catalogs: [
        {
          catalog: { supports_cpu_target_restrictions: false },
          enabled_cpu_family: ['x86_64'],
          enabled_cpu_microarchitectures: ['zen3'],
        },
      ],
    } as any;

    const row = {
      name: 'numpy',
      versions: [
        {
          uuid: 'v1',
          version: '1.0',
          targets: [
            { target_name: 'build_variant', target_subtype: 'default' },
          ],
        },
        {
          uuid: 'v2',
          version: '2.0',
          targets: [{ target_name: 'x86_64' }],
        },
      ],
    } as any;

    render(<SoftwarePackageExpandableRow row={row} offering={offering} />);

    expect(screen.getByText('2.0, 1.0')).toBeInTheDocument();
  });
});
