import { useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { ComponentsUsageStatsPerOffering, Project } from 'waldur-js-client';

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
  const effectiveType = activeType ?? componentTypes[0]?.type;

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

  const showComponentTypeTabs = componentTypes.length > 1;

  return (
    <>
      {showComponentTypeTabs && (
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <small className="text-secondary fw-medium">
            {translate('Component type')}:
          </small>
          <Nav
            variant="tabs"
            className="nav-line-tabs"
            activeKey={effectiveType}
            onSelect={(key) => key && setActiveType(key)}
          >
            {componentTypes.map(({ type, name }) => (
              <Nav.Item key={type}>
                <Nav.Link eventKey={type} title={`type=${type}`}>
                  {name}
                  <small
                    className="text-muted ms-1"
                    style={{ fontWeight: 400 }}
                  >
                    ({type})
                  </small>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      )}
      <div className="d-flex align-items-center gap-2 mb-1">
        <small className="text-secondary">
          {translate(
            'X-axis: offering · Y-axis: usage stacked under remaining capacity (linear scale, in component’s measured_unit).',
          )}
        </small>
      </div>
      <EChart options={options} height="200px" />
    </>
  );
};
