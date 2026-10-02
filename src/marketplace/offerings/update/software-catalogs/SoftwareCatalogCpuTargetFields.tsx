import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { marketplaceSoftwareCatalogsCpuTargetsList } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import {
  canonicalizeCpuMicroarchitectures,
  keepAllowedCpuValues,
  resolveSoftwareCatalogFromForm,
} from '../../softwareCatalogCpu';

const sameCpuValues = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const SoftwareCatalogCpuTargetFields: FC = () => {
  const form = useForm();
  const { values } = useFormState({
    subscription: { values: true },
  });

  const catalog = resolveSoftwareCatalogFromForm(values.catalog);
  const supportsCpuTargetRestrictions = Boolean(
    catalog?.supports_cpu_target_restrictions,
  );
  const catalogUuid = catalog?.uuid;
  const [droppedValues, setDroppedValues] = useState<string[]>([]);

  const {
    data: cpuTargets = [],
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ['marketplace-software-catalog-cpu-targets', catalogUuid],
    queryFn: async () => {
      const response = await marketplaceSoftwareCatalogsCpuTargetsList({
        path: { uuid: catalogUuid! },
      });
      return response.data ?? [];
    },
    enabled: Boolean(catalogUuid && supportsCpuTargetRestrictions),
  });

  const selectedFamilies: string[] = values.enabled_cpu_family || [];
  const selectedMicroarchitectures: string[] =
    values.enabled_cpu_microarchitectures || [];

  const familyOptions = useMemo(() => {
    const families = [...new Set(cpuTargets.map((t) => t.cpu_family))].sort();
    return families.map((family) => ({
      value: family,
      label: family,
    }));
  }, [cpuTargets]);

  const microarchitectureOptions = useMemo(() => {
    const filtered = cpuTargets.filter(
      (target) =>
        selectedFamilies.length === 0 ||
        selectedFamilies.includes(target.cpu_family),
    );
    const seen = new Set<string>();
    return filtered
      .filter((target) => {
        if (seen.has(target.cpu_microarchitecture)) {
          return false;
        }
        seen.add(target.cpu_microarchitecture);
        return true;
      })
      .map((target) => ({
        value: target.cpu_microarchitecture,
        label: target.full_arch,
      }));
  }, [cpuTargets, selectedFamilies]);

  useEffect(() => {
    setDroppedValues([]);
  }, [catalogUuid]);

  // Same pattern as FormQoSSelectionStep: once allowed options are known,
  // bring saved values in line with them. Legacy short tokens (zen3) are
  // mapped to the catalog's subtype (amd/zen3) rather than dropped, because
  // an emptied list means "no restriction" once saved. Whatever cannot be
  // mapped is reported, and nothing is touched while the list is empty.
  useEffect(() => {
    if (!isSuccess || cpuTargets.length === 0) {
      return;
    }

    const nextFamilies = keepAllowedCpuValues(
      selectedFamilies,
      familyOptions.map((option) => option.value),
    );
    const canonical = canonicalizeCpuMicroarchitectures(
      selectedMicroarchitectures,
      cpuTargets,
    );
    const nextMicroarchitectures = keepAllowedCpuValues(
      canonical.values,
      cpuTargets
        .filter(
          (target) =>
            nextFamilies.length === 0 ||
            nextFamilies.includes(target.cpu_family),
        )
        .map((target) => target.cpu_microarchitecture),
    );
    const dropped = [
      ...selectedFamilies.filter((value) => !nextFamilies.includes(value)),
      ...canonical.dropped,
    ];
    if (dropped.length > 0) {
      setDroppedValues((previous) => [...new Set([...previous, ...dropped])]);
    }

    if (
      sameCpuValues(selectedFamilies, nextFamilies) &&
      sameCpuValues(selectedMicroarchitectures, nextMicroarchitectures)
    ) {
      return;
    }

    form.batch(() => {
      if (!sameCpuValues(selectedFamilies, nextFamilies)) {
        form.change('enabled_cpu_family', nextFamilies);
      }
      if (!sameCpuValues(selectedMicroarchitectures, nextMicroarchitectures)) {
        form.change('enabled_cpu_microarchitectures', nextMicroarchitectures);
      }
    });
  }, [
    form,
    isSuccess,
    cpuTargets,
    selectedFamilies,
    selectedMicroarchitectures,
    familyOptions,
  ]);

  if (!supportsCpuTargetRestrictions) {
    return null;
  }

  if (isError) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load CPU targets.')}
      />
    );
  }

  const emptyTargetsDescription =
    isSuccess && cpuTargets.length === 0
      ? translate(
          'No CPU targets are available for this catalog version. Sync the catalog or choose another version.',
        )
      : undefined;

  return (
    <>
      <SelectGroup
        name="enabled_cpu_family"
        label={translate('Enabled CPU family')}
        placeholder={translate('Select CPU family...')}
        options={familyOptions}
        isMulti
        isClearable
        simpleValue
        isLoading={isLoading}
        disabled={isSuccess && familyOptions.length === 0}
        description={emptyTargetsDescription}
      />
      <SelectGroup
        name="enabled_cpu_microarchitectures"
        label={translate('Enabled CPU microarchitecture')}
        placeholder={translate('Select CPU microarchitecture...')}
        options={microarchitectureOptions}
        isMulti
        isClearable
        simpleValue
        isLoading={isLoading}
        disabled={isSuccess && microarchitectureOptions.length === 0}
        description={
          droppedValues.length > 0
            ? translate(
                'Removed saved values that this catalog version does not provide: {values}. Select replacements before saving, or the offering will not be restricted to them.',
                { values: droppedValues.join(', ') },
              )
            : undefined
        }
      />
    </>
  );
};
