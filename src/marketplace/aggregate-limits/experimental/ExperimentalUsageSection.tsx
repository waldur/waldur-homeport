import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';
import {
  Project,
  marketplaceCustomerUsageComponentsUsageRetrieve,
  marketplaceProjectUsageComponentsUsageRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

import { AggregateUsageTimelineWidget } from '../AggregateUsageTimelineWidget';

import { ExperimentalAggregateLimitWidget } from './ExperimentalAggregateLimitWidget';
import { TraceabilityPopover } from './TraceabilityPopover';
import { GaugeGridView } from './views/GaugeGridView';
import { LimitHorizonView } from './views/LimitHorizonView';
import { PeriodOverPeriodView } from './views/PeriodOverPeriodView';
import { TreemapView } from './views/TreemapView';

type Variant =
  | 'per-offering-bars'
  | 'timeline'
  | 'gauges'
  | 'treemap'
  | 'limit-horizon'
  | 'period-over-period';

interface VariantInfo {
  key: Variant;
  label: string;
  hint: string;
}

// translate() calls at module init turn into string lookups so the lint
// rule "no-template-in-translate" stays happy when we render v.label later.
const VARIANTS: VariantInfo[] = [
  {
    key: 'per-offering-bars',
    label: translate('Per-offering bars'),
    hint: translate(
      'Stacked bar of usage vs remaining cap, one bar per offering.',
    ),
  },
  {
    key: 'gauges',
    label: translate('Gauges'),
    hint: translate(
      'One 0–100% dial per limit-based row. Hides usage-only rows.',
    ),
  },
  {
    key: 'treemap',
    label: translate('Treemap'),
    hint: translate(
      'Hierarchy: offering → billing_type → component, sized by usage / limit / %.',
    ),
  },
  {
    key: 'limit-horizon',
    label: translate('Limit horizon'),
    hint: translate(
      'Gantt-style: one row per (offering · component) with usage saturation bars, "Today" line and next-reset markers.',
    ),
  },
  {
    key: 'timeline',
    label: translate('Timeline'),
    hint: translate(
      'Per-offering bucketed usage timeline (existing branch widget).',
    ),
  },
  {
    key: 'period-over-period',
    label: translate('Period-over-period'),
    hint: translate(
      'Current period overlaid against previous, per (offering, component).',
    ),
  },
];

interface Props {
  project?: Project;
  customer?: Customer;
}

export const ExperimentalUsageSection: FC<Props> = ({ project, customer }) => {
  const isProject = !!project;
  const scope = project ?? customer;
  const [variant, setVariant] = useState<Variant>('per-offering-bars');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      isProject
        ? 'exp-project-components-usage'
        : 'exp-customer-components-usage',
      scope?.uuid,
    ],
    queryFn: () => {
      if (!scope?.uuid) return null;
      const fetcher = isProject
        ? marketplaceProjectUsageComponentsUsageRetrieve
        : marketplaceCustomerUsageComponentsUsageRetrieve;
      return fetcher({ path: { uuid: scope.uuid } }).then((r) => r.data);
    },
    enabled: !!scope?.uuid,
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  if (!scope) return null;

  const components = data?.components || [];
  const activeVariant = VARIANTS.find((v) => v.key === variant) ?? VARIANTS[0];

  return (
    <Row className="mt-3">
      <Col xs={12} className="mb-3">
        <div className="card card-bordered border-warning">
          <div className="card-body py-3">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
              <span className="badge bg-warning text-dark">
                {translate('Experimental')}
              </span>
              <strong>{translate('Per-offering usage views')}</strong>
              <TraceabilityPopover
                id="exp-section-overview"
                title={translate('Section overview')}
                rows={[
                  {
                    label: translate('Why this section exists'),
                    value: translate(
                      'Alternate visualisations for per-offering usage. Every variant is gated behind marketplace.show_experimental_ui_components so the default dashboard matches upstream/develop exactly.',
                    ),
                  },
                  {
                    label: translate('Feature flag'),
                    value:
                      'MarketplaceFeatures.show_experimental_ui_components (src/FeaturesEnums.ts) — checked via isExperimentalUiComponentsVisible() (src/marketplace/utils.ts).',
                  },
                  {
                    label: translate('Data fetched once at section level'),
                    value: isProject
                      ? 'GET /api/marketplace-project-usage/{uuid}/components-usage/'
                      : 'GET /api/marketplace-customer-usage/{uuid}/components-usage/',
                  },
                  {
                    label: translate('Backend view'),
                    value: isProject
                      ? 'MarketplaceProjectUsageViewSet.components_usage (waldur-mastermind/src/waldur_mastermind/marketplace/views.py:15572)'
                      : 'MarketplaceCustomerUsageViewSet.components_usage (waldur-mastermind/src/waldur_mastermind/marketplace/views.py:15489)',
                  },
                  {
                    label: translate('Per-variant data sources'),
                    value:
                      'Each variant declares its own additional endpoints and aggregations in the MixBanner popover above its chart — there is no implicit shared data beyond the section-level row set.',
                  },
                ]}
              />
            </div>
            <Nav
              variant="pills"
              className="flex-wrap gap-1"
              activeKey={variant}
              onSelect={(k) => k && setVariant(k as Variant)}
            >
              {VARIANTS.map((v) => (
                <Nav.Item key={v.key}>
                  <Nav.Link
                    eventKey={v.key}
                    title={v.hint}
                    className="px-2 py-1 small"
                  >
                    {v.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
            <small className="d-block text-muted mt-2">
              {activeVariant.hint}
            </small>
          </div>
        </div>
      </Col>
      <Col xs={12} className="mb-5">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {variant === 'per-offering-bars' && (
              <ExperimentalAggregateLimitWidget
                project={project}
                customer={customer}
                data={data || { components: [] }}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
              />
            )}
            {variant === 'timeline' && (
              <AggregateUsageTimelineWidget
                project={project}
                customer={customer}
                components={components}
              />
            )}
            {variant === 'gauges' && <GaugeGridView components={components} />}
            {variant === 'treemap' && <TreemapView components={components} />}
            {variant === 'limit-horizon' && (
              <LimitHorizonView
                project={project}
                customer={customer}
                components={components}
              />
            )}
            {variant === 'period-over-period' && (
              <PeriodOverPeriodView
                project={project}
                customer={customer}
                components={components}
              />
            )}
          </>
        )}
      </Col>
    </Row>
  );
};
