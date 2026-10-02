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
