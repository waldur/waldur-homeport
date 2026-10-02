import { describe, expect, it } from 'vitest';

import {
  canonicalizeCpuMicroarchitectures,
  catalogSupportsCpuTargetRestrictions,
  getCpuRestrictedOfferingCatalogs,
  getOfferingEnabledCpuFamilies,
  getOfferingEnabledCpuMicroarchitectures,
  keepAllowedCpuValues,
  resolveSoftwareCatalogFromForm,
} from './softwareCatalogCpu';

describe('softwareCatalogCpu', () => {
  const links = [
    {
      uuid: 'spack-link',
      catalog: {
        uuid: 'spack-catalog',
        supports_cpu_target_restrictions: false,
      },
      enabled_cpu_family: ['x86_64'],
      enabled_cpu_microarchitectures: ['zen3'],
    },
    {
      uuid: 'eessi-link',
      catalog: {
        uuid: 'eessi-catalog',
        supports_cpu_target_restrictions: true,
      },
      enabled_cpu_family: ['x86_64'],
      enabled_cpu_microarchitectures: ['amd/zen3'],
    },
  ] as any;

  it('ignores CPU settings on catalogs without CPU restrictions', () => {
    expect(getCpuRestrictedOfferingCatalogs(links)).toHaveLength(1);
    expect(getOfferingEnabledCpuFamilies(links)).toEqual(['x86_64']);
    expect(getOfferingEnabledCpuMicroarchitectures(links)).toEqual([
      'amd/zen3',
    ]);
  });

  it('treats only object catalogs with the flag as CPU-restricted', () => {
    expect(catalogSupportsCpuTargetRestrictions(undefined)).toBe(false);
    expect(catalogSupportsCpuTargetRestrictions('catalog-uuid')).toBe(false);
    expect(
      catalogSupportsCpuTargetRestrictions({
        uuid: 'spack',
        supports_cpu_target_restrictions: false,
      }),
    ).toBe(false);
    expect(
      catalogSupportsCpuTargetRestrictions({
        uuid: 'eessi',
        supports_cpu_target_restrictions: true,
      }),
    ).toBe(true);
    expect(resolveSoftwareCatalogFromForm('catalog-uuid')).toBeUndefined();
  });

  it('keeps only CPU values present in the allowed list', () => {
    expect(keepAllowedCpuValues(['zen3', 'amd/zen3'], ['amd/zen3'])).toEqual([
      'amd/zen3',
    ]);
    expect(keepAllowedCpuValues(['amd/zen3'], ['neoverse_v1'])).toEqual([]);
    expect(keepAllowedCpuValues(undefined, ['amd/zen3'])).toEqual([]);
  });

  describe('canonicalizeCpuMicroarchitectures', () => {
    const targets = [
      { cpu_microarchitecture: 'generic' },
      { cpu_microarchitecture: 'amd/zen3' },
      { cpu_microarchitecture: 'intel/haswell' },
      { cpu_microarchitecture: 'intel/skylake_avx512' },
      { cpu_microarchitecture: 'nvidia/grace' },
      { cpu_microarchitecture: 'vendor/grace' },
    ];

    it('keeps exact matches and maps short tokens by their last segment', () => {
      expect(
        canonicalizeCpuMicroarchitectures(
          ['generic', 'zen3', 'haswell', 'amd/zen3'],
          targets,
        ),
      ).toEqual({
        values: ['generic', 'amd/zen3', 'intel/haswell'],
        dropped: [],
      });
    });

    it('reports values with no match or an ambiguous match', () => {
      expect(
        canonicalizeCpuMicroarchitectures(['cascadelake', 'grace'], targets),
      ).toEqual({ values: [], dropped: ['cascadelake', 'grace'] });
    });

    it('does not match on a partial segment', () => {
      expect(
        canonicalizeCpuMicroarchitectures(['avx512'], targets).dropped,
      ).toEqual(['avx512']);
    });

    it('treats a missing value as empty', () => {
      expect(canonicalizeCpuMicroarchitectures(undefined, targets)).toEqual({
        values: [],
        dropped: [],
      });
    });
  });
});
