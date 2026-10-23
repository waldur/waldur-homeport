import { useId, useMemo, useState } from 'react';
import { ComponentsUsageStatsPerOffering, Project } from 'waldur-js-client';

import { Select } from 'waldur-ui';

import { EChart } from '@/core/EChart';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

import { useAggregateLimitChart } from './utils';

interface PerOfferingBarsWidgetProps {
  project?: Project;
  customer?: Customer;
  data: ComponentsUsageStatsPerOffering;
  isLoading: boolean;
  refetch(): void;
  error: any;
}

export const PerOfferingBarsWidget = ({
  project,
  data,
  isLoading,
  error,
  refetch,
}: PerOfferingBarsWidgetProps) => {
  const isProject = !!project;

  // Group rows by component type so users can switch between e.g.
  // Compute / Storage / Inodes when an offering ecosystem mixes them.
  // Each type uses the first matching component's `name` as the label.
  const componentTypes = useMemo(() => {
    if (!data?.components?.length) return [];
    const seen = new Map<string, string>();
    for (const c of data.components) {
      if (!seen.has(c.type)) seen.set(c.type, c.name);
    }
    return Array.from(seen, ([type, name]) => ({ type, name }));
  }, [data]);

  const [activeType, setActiveType] = useState<string | undefined>();
  const labelId = useId();
  const effectiveType = activeType ?? componentTypes[0]?.type;

  const typeOptions = useMemo(
    () =>
      componentTypes.map(({ type, name }) => ({
        value: type,
        label: name !== type ? `${name} (${type})` : name,
        type,
        name,
      })),
    [componentTypes],
  );

  const selectedOption = useMemo(
    () =>
      typeOptions.find((opt) => opt.value === effectiveType) ?? typeOptions[0],
    [typeOptions, effectiveType],
  );

  const filteredData = useMemo(() => {
    if (!data?.components?.length || componentTypes.length <= 1) return data;
    return {
      components: data.components.filter((c) => c.type === effectiveType),
    };
  }, [data, componentTypes, effectiveType]);

  const { options } = useAggregateLimitChart(
    filteredData || { components: [] },
    6,
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={
          isProject
            ? translate('Unable to load aggregate limits for this project')
            : translate('Unable to load aggregate limits for this customer')
        }
      />
    );
  }

  const components = data?.components;

  if (!components?.length || !options) {
    return null;
  }

  const showComponentTypeSelect = componentTypes.length > 1;

  const chart = (
    <>
      <div className="flex items-center gap-2 mb-1">
        <small className="text-secondary">
          {translate(
            'X-axis: offering · Y-axis: usage stacked under remaining capacity (linear scale, in component’s measured_unit).',
          )}
        </small>
      </div>
      <EChart options={options} height="200px" />
    </>
  );

  if (!showComponentTypeSelect) {
    return chart;
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <small id={labelId} className="text-secondary">
          {translate('Component type')}:
        </small>
        <div className="min-w-[200px]">
          <Select
            aria-labelledby={labelId}
            aria-label={translate('Component type')}
            size="sm"
            isClearable={false}
            isSearchable={false}
            value={selectedOption}
            onChange={(opt: any) => setActiveType(opt?.value)}
            options={typeOptions}
            formatOptionLabel={(opt: any) => (
              <span>
                {opt.name}
                <small className="text-quaternary ms-1 font-normal">
                  ({opt.type})
                </small>
              </span>
            )}
          />
        </div>
      </div>
      {chart}
    </>
  );
};
