import { NestedSoftwareCatalog, Offering } from 'waldur-js-client';

export type CatalogCpuFormValue = {
  uuid?: string;
  supports_cpu_target_restrictions?: boolean;
};

export const resolveSoftwareCatalogFromForm = (
  catalog: CatalogCpuFormValue | string | undefined,
): CatalogCpuFormValue | undefined => {
  if (!catalog || typeof catalog === 'string') {
    return undefined;
  }
  return catalog;
};

export const catalogSupportsCpuTargetRestrictions = (
  catalog: CatalogCpuFormValue | string | undefined,
): boolean =>
  Boolean(
    resolveSoftwareCatalogFromForm(catalog)?.supports_cpu_target_restrictions,
  );

export const getCpuRestrictedOfferingCatalogs = (
  softwareCatalogs: Offering['software_catalogs'] | undefined,
): NestedSoftwareCatalog[] =>
  softwareCatalogs?.filter((link) =>
    Boolean(link.catalog?.supports_cpu_target_restrictions),
  ) ?? [];

export const getOfferingEnabledCpuFamilies = (
  softwareCatalogs: Offering['software_catalogs'] | undefined,
): string[] =>
  getCpuRestrictedOfferingCatalogs(softwareCatalogs).flatMap(
    (link) => link.enabled_cpu_family || [],
  );

export const getOfferingEnabledCpuMicroarchitectures = (
  softwareCatalogs: Offering['software_catalogs'] | undefined,
): string[] =>
  getCpuRestrictedOfferingCatalogs(softwareCatalogs).flatMap(
    (link) => link.enabled_cpu_microarchitectures || [],
  );

/**
 * Map saved microarchitectures onto this catalog's targets.
 *
 * Links saved before the CPU target API hold short tokens (`zen3`,
 * `haswell`), while targets use the loader's subtype (`amd/zen3`,
 * `intel/haswell`). A short token maps to the one target ending in
 * `/<token>`; values with no match, or more than one, are returned in
 * `dropped` so the form can tell the user instead of silently widening
 * the restriction.
 */
export const canonicalizeCpuMicroarchitectures = (
  current: unknown,
  targets: readonly { cpu_microarchitecture: string }[],
): { values: string[]; dropped: string[] } => {
  if (!Array.isArray(current)) {
    return { values: [], dropped: [] };
  }
  const known = [...new Set(targets.map((t) => t.cpu_microarchitecture))];
  const values: string[] = [];
  const dropped: string[] = [];
  for (const value of current) {
    if (typeof value !== 'string') {
      continue;
    }
    const match = known.includes(value)
      ? [value]
      : known.filter((candidate) => candidate.endsWith(`/${value}`));
    if (match.length === 1) {
      if (!values.includes(match[0])) {
        values.push(match[0]);
      }
    } else {
      dropped.push(value);
    }
  }
  return { values, dropped };
};

export const keepAllowedCpuValues = (
  current: unknown,
  allowed: readonly string[],
): string[] => {
  if (!Array.isArray(current)) {
    return [];
  }
  const allowedSet = new Set(allowed);
  return current.filter(
    (value): value is string =>
      typeof value === 'string' && allowedSet.has(value),
  );
};

export type CpuTargetRef = {
  cpu_family: string;
  cpu_microarchitecture: string;
  full_arch: string;
};

export type CpuMicroarchitectureOption = {
  value: string;
  /** Name shown on the chip. One build's own hardware path, or the build token when several paths are that build. */
  label: string;
  /** Other machines that reuse this build. Empty when `label` is not a single hardware path. */
  alsoCovers: string[];
  /** Hardware paths to list when the label is the build token rather than one path. */
  coveredPaths: string[];
};

/** Subtype of a hardware path, matching the backend's `split_eessi_cpu_arch`. */
const hardwareSubtype = (fullArch: string): string => {
  const slash = fullArch.indexOf('/');
  return slash === -1 ? 'generic' : fullArch.slice(slash + 1);
};

/**
 * One dropdown option per EESSI build.
 *
 * `cpu_microarchitecture` is the build packages are filtered by. Several
 * hardware paths can share it (Granite Rapids runs the Sapphire Rapids
 * build). The option is named after the path that is that build. Other
 * paths are aliases. When more than one path is the build itself, as with
 * `generic` on several families, the label is the token and every path is
 * listed.
 */
export const buildCpuMicroarchitectureOptions = (
  targets: readonly CpuTargetRef[],
): CpuMicroarchitectureOption[] => {
  const groups = new Map<string, CpuTargetRef[]>();
  for (const target of targets) {
    if (!target.cpu_microarchitecture || !target.full_arch) {
      continue;
    }
    const rows = groups.get(target.cpu_microarchitecture);
    if (rows) {
      if (!rows.some((row) => row.full_arch === target.full_arch)) {
        rows.push(target);
      }
    } else {
      groups.set(target.cpu_microarchitecture, [target]);
    }
  }

  return [...groups.entries()].map(([token, rows]) => {
    const canonical = rows.filter(
      (row) => hardwareSubtype(row.full_arch) === token,
    );
    if (canonical.length === 1) {
      const canonicalPath = canonical[0].full_arch;
      return {
        value: token,
        label: canonicalPath,
        alsoCovers: rows
          .filter((row) => row.full_arch !== canonicalPath)
          .map((row) => row.full_arch),
        coveredPaths: [],
      };
    }
    return {
      value: token,
      label: token,
      alsoCovers: [],
      coveredPaths: rows.map((row) => row.full_arch),
    };
  });
};

/** Match the build name and every hardware path, so "granite" finds Sapphire Rapids. */
export const cpuMicroarchitectureOptionMatches = (
  option: {
    label: string;
    data?: Pick<
      CpuMicroarchitectureOption,
      'value' | 'alsoCovers' | 'coveredPaths'
    >;
  },
  rawInput: string,
): boolean => {
  const query = rawInput.trim().toLowerCase();
  if (!query) {
    return true;
  }
  const data = option.data;
  const fields = [
    option.label,
    data?.value,
    ...(data?.alsoCovers ?? []),
    ...(data?.coveredPaths ?? []),
  ];
  return fields.some(
    (field) => typeof field === 'string' && field.toLowerCase().includes(query),
  );
};
