import { useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { ComponentsUsageStatsPerOffering, Project } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

import { TraceabilityPopover } from './TraceabilityPopover';
import { useAggregateLimitChart } from './utils.experimental';

interface ExperimentalAggregateLimitWidgetProps {
  project?: Project;
  customer?: Customer;
  data: ComponentsUsageStatsPerOffering;
  isLoading: boolean;
  refetch(): void;
  error: any;
}

export const ExperimentalAggregateLimitWidget = ({
  project,
  data,
  isLoading,
  error,
  refetch,
}: ExperimentalAggregateLimitWidgetProps) => {
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

  const TitleWithTrace = (
    <span className="d-inline-flex align-items-center gap-2">
      {translate('Usage vs limits in current period (per-offering)')}
      <TraceabilityPopover
        id="exp-bars-title"
        title={translate('Where this data comes from')}
        rows={[
          {
            label: translate('Endpoint'),
            value: isProject
              ? 'GET /api/marketplace-project-usage/{uuid}/components-usage/'
              : 'GET /api/marketplace-customer-usage/{uuid}/components-usage/',
          },
          {
            label: translate('Backend serializer'),
            value:
              'ComponentsUsageStatsPerOfferingSerializer (waldur-mastermind/src/waldur_mastermind/marketplace/serializers.py)',
          },
          {
            label: translate('Aggregation function'),
            value:
              'get_components_usage_data_per_offering — waldur-mastermind/src/waldur_mastermind/marketplace/utils.py:1318',
          },
          {
            label: translate('What it returns'),
            value: translate(
              'One row per (offering × component_type × billing_type). Usage = SUM(ComponentUsage.usage) for billing_period inside the component’s current period; Limit = SUM(Resource.limits[component.type]) across the offering’s resources.',
            ),
          },
        ]}
      />
    </span>
  );

  return (
    <WidgetCard cardTitle={TitleWithTrace} className="h-100">
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
          <TraceabilityPopover
            id="exp-bars-tabs"
            title={translate('Tab grouping')}
            rows={[
              {
                label: translate('Source field'),
                value:
                  'OfferingComponent.type (DB: marketplace_offeringcomponent.type)',
              },
              {
                label: translate('Logic'),
                value: translate(
                  'Distinct component types observed across the offerings in scope. The label uses OfferingComponent.name from the first row of each type.',
                ),
              },
              {
                label: translate('Frontend code'),
                value:
                  'src/marketplace/aggregate-limits/experimental/ExperimentalAggregateLimitWidget.tsx:36',
              },
            ]}
          />
        </div>
      )}
      <div className="d-flex align-items-center gap-2 mb-1">
        <small className="text-secondary">
          {translate(
            'X-axis: offering · Y-axis: usage stacked under remaining capacity (linear scale, in component’s measured_unit).',
          )}
        </small>
        <TraceabilityPopover
          id="exp-bars-axes"
          title={translate('Axes / series')}
          rows={[
            {
              label: translate('X-axis (offering name)'),
              value:
                'ComponentStatsPerOffering.offering_name → Offering.name (DB: marketplace_offering.name)',
            },
            {
              label: translate('Y-axis usage value'),
              value:
                'billing_type=usage → SUM(ComponentUsage.usage); billing_type=limit → resource.limits.<type> per resource (utils.py:1379-1387).',
            },
            {
              label: translate('Remaining (lighter bar)'),
              value:
                'max(0, limit − usage). Limit = SUM(Resource.limits[component.type]) over the offering’s resources (utils.py:1365-1377). null/no cap → bar omitted.',
            },
            {
              label: translate('Period window'),
              value:
                'Per OfferingComponent.limit_period: month / quarterly / annual / total. Resolved by _resolve_period_bounds (utils.py:1261-1315). Filter applied to ComponentUsage.billing_period.',
            },
          ]}
        />
      </div>
      <EChart options={options} height="200px" />
    </WidgetCard>
  );
};
