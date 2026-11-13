import { describe, expect, it } from 'vitest';

import {
  buildCpuMicroarchitectureOptions,
  canonicalizeCpuMicroarchitectures,
  catalogSupportsCpuTargetRestrictions,
  cpuMicroarchitectureOptionMatches,
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

  describe('buildCpuMicroarchitectureOptions', () => {
    const eessi2023 = [
      {
        cpu_family: 'aarch64',
        cpu_microarchitecture: 'neoverse_v1',
        full_arch: 'aarch64/aws/graviton4',
      },
      {
        cpu_family: 'aarch64',
        cpu_microarchitecture: 'neoverse_v1',
        full_arch: 'aarch64/neoverse_v1',
      },
      {
        cpu_family: 'aarch64',
        cpu_microarchitecture: 'generic',
        full_arch: 'aarch64/generic',
      },
      {
        cpu_family: 'riscv64',
        cpu_microarchitecture: 'generic',
        full_arch: 'riscv64/generic',
      },
      {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'amd/zen4',
        full_arch: 'x86_64/amd/zen4',
      },
      {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'amd/zen4',
        full_arch: 'x86_64/amd/zen5',
      },
      {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'generic',
        full_arch: 'x86_64/generic',
      },
      {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'intel/sapphirerapids',
        full_arch: 'x86_64/intel/graniterapids',
      },
      {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'intel/sapphirerapids',
        full_arch: 'x86_64/intel/sapphirerapids',
      },
    ];

    it('names a shared build after its own machine and lists the others', () => {
      const options = buildCpuMicroarchitectureOptions(eessi2023);
      expect(
        options.find((option) => option.value === 'intel/sapphirerapids'),
      ).toEqual({
        value: 'intel/sapphirerapids',
        label: 'x86_64/intel/sapphirerapids',
        alsoCovers: ['x86_64/intel/graniterapids'],
        coveredPaths: [],
      });
      expect(options.find((option) => option.value === 'amd/zen4')).toEqual({
        value: 'amd/zen4',
        label: 'x86_64/amd/zen4',
        alsoCovers: ['x86_64/amd/zen5'],
        coveredPaths: [],
      });
      expect(options.find((option) => option.value === 'neoverse_v1')).toEqual({
        value: 'neoverse_v1',
        label: 'aarch64/neoverse_v1',
        alsoCovers: ['aarch64/aws/graviton4'],
        coveredPaths: [],
      });
    });

    it('keeps one option per build even when the alias sorts first', () => {
      const options = buildCpuMicroarchitectureOptions(eessi2023);
      expect(
        options.filter((option) => option.value === 'intel/sapphirerapids'),
      ).toHaveLength(1);
      expect(options.map((option) => option.label)).not.toContain(
        'x86_64/intel/graniterapids',
      );
    });

    it('labels a single hardware path with that path', () => {
      expect(
        buildCpuMicroarchitectureOptions([
          {
            cpu_family: 'x86_64',
            cpu_microarchitecture: 'amd/zen3',
            full_arch: 'x86_64/amd/zen3',
          },
        ]),
      ).toEqual([
        {
          value: 'amd/zen3',
          label: 'x86_64/amd/zen3',
          alsoCovers: [],
          coveredPaths: [],
        },
      ]);
    });

    it('labels generic with the family path when only one family is in the list', () => {
      expect(
        buildCpuMicroarchitectureOptions(
          eessi2023.filter((target) => target.cpu_family === 'x86_64'),
        ).find((option) => option.value === 'generic'),
      ).toEqual({
        value: 'generic',
        label: 'x86_64/generic',
        alsoCovers: [],
        coveredPaths: [],
      });
    });

    it('labels generic with the token when several families share it', () => {
      expect(
        buildCpuMicroarchitectureOptions(eessi2023).find(
          (option) => option.value === 'generic',
        ),
      ).toEqual({
        value: 'generic',
        label: 'generic',
        alsoCovers: [],
        coveredPaths: ['aarch64/generic', 'riscv64/generic', 'x86_64/generic'],
      });
    });

    it('falls back to the build token when no hardware path is that build', () => {
      expect(
        buildCpuMicroarchitectureOptions([
          {
            cpu_family: 'x86_64',
            cpu_microarchitecture: 'intel/skylake_avx512',
            full_arch: 'x86_64/intel/graniterapids',
          },
        ]),
      ).toEqual([
        {
          value: 'intel/skylake_avx512',
          label: 'intel/skylake_avx512',
          alsoCovers: [],
          coveredPaths: ['x86_64/intel/graniterapids'],
        },
      ]);
    });

    it('does not repeat a hardware path', () => {
      const row = {
        cpu_family: 'x86_64',
        cpu_microarchitecture: 'intel/sapphirerapids',
        full_arch: 'x86_64/intel/graniterapids',
      };
      expect(
        buildCpuMicroarchitectureOptions([row, row])[0].coveredPaths,
      ).toEqual(['x86_64/intel/graniterapids']);
    });
  });

  describe('cpuMicroarchitectureOptionMatches', () => {
    const option = {
      label: 'x86_64/intel/sapphirerapids',
      data: {
        value: 'intel/sapphirerapids',
        alsoCovers: ['x86_64/intel/graniterapids'],
        coveredPaths: [],
      },
    };

    it('matches the build name and an alias', () => {
      expect(cpuMicroarchitectureOptionMatches(option, 'sapphire')).toBe(true);
      expect(cpuMicroarchitectureOptionMatches(option, 'Granite')).toBe(true);
      expect(cpuMicroarchitectureOptionMatches(option, 'zen5')).toBe(false);
    });

    it('keeps every option when the query is empty', () => {
      expect(cpuMicroarchitectureOptionMatches(option, '  ')).toBe(true);
    });
  });
});
