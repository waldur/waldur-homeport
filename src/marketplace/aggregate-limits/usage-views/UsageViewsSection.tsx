import { QuestionIcon } from '@phosphor-icons/react';
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
import { Panel } from '@/core/Panel';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { DashboardFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

import { PerOfferingBarsWidget } from './PerOfferingBarsWidget';
import { LimitHorizonView } from './views/LimitHorizonView';
import { PeriodOverPeriodView } from './views/PeriodOverPeriodView';
import { TreemapView } from './views/TreemapView';

type Variant =
  'per-offering-bars' | 'treemap' | 'limit-horizon' | 'period-over-period';

interface VariantInfo {
  key: Variant;
  /** Each view is released on its own, so operators can adopt them one at a time. */
  feature: DashboardFeatures;
  label: string;
  hint: string;
}

// translate() calls at module init turn into string lookups so the lint
// rule "no-template-in-translate" stays happy when we render v.label later.
const VARIANTS: VariantInfo[] = [
  {
    key: 'per-offering-bars',
    feature: DashboardFeatures.usage_per_offering_bars,
    label: translate('Per-offering bars'),
    hint: translate(
      'Stacked bar of usage vs remaining cap, one bar per offering.',
    ),
  },
  {
    key: 'treemap',
    feature: DashboardFeatures.usage_treemap,
    label: translate('Treemap'),
    hint: translate(
      'Hierarchy: offering → billing_type → component, sized by usage / limit / %.',
    ),
  },
  {
    key: 'limit-horizon',
    feature: DashboardFeatures.usage_limit_horizon,
    label: translate('Limit horizon'),
    hint: translate(
      'Gantt-style: one row per (offering · component) with usage saturation bars, "Today" line and next-reset markers.',
    ),
  },
  {
    key: 'period-over-period',
    feature: DashboardFeatures.usage_period_over_period,
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

/**
 * Gate: renders nothing — and fetches nothing — unless at least one view is
 * enabled. Kept free of hooks so the early return cannot reorder them.
 */
export const UsageViewsSection: FC<Props> = ({ project, customer }) => {
  const variants = VARIANTS.filter((v) => isFeatureVisible(v.feature));
  if (!variants.length || !(project ?? customer)) {
    return null;
  }
  return (
    <UsageViews project={project} customer={customer} variants={variants} />
  );
};

const UsageViews: FC<Props & { variants: VariantInfo[] }> = ({
  project,
  customer,
  variants,
}) => {
  const isProject = !!project;
  const scope = project ?? customer;
  const [variant, setVariant] = useState<Variant>(variants[0].key);

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

  const components = data?.components || [];
  // A view disabled after the user picked it would leave `variant` dangling.
  const activeVariant = variants.find((v) => v.key === variant) ?? variants[0];

  return (
    <Row className="mt-3">
      <Col xs={12} className="mb-5">
        <Panel
          cardBordered
          title={
            <>
              {translate('Per-offering usage views')}{' '}
              <Tip id="usage-views-hint" label={activeVariant.hint}>
                <QuestionIcon weight="bold" />
              </Tip>
            </>
          }
          actions={
            variants.length > 1 && (
              <Nav
                variant="tabs"
                className="nav-line-tabs flex-nowrap border-0"
                activeKey={activeVariant.key}
                onSelect={(k) => k && setVariant(k as Variant)}
              >
                {variants.map((v) => (
                  <Nav.Item key={v.key}>
                    <Nav.Link eventKey={v.key} title={v.hint}>
                      {v.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            )
          }
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeVariant.key === 'per-offering-bars' && (
                <PerOfferingBarsWidget
                  project={project}
                  customer={customer}
                  data={data || { components: [] }}
                  isLoading={isLoading}
                  error={error}
                  refetch={refetch}
                />
              )}
              {activeVariant.key === 'treemap' && (
                <TreemapView components={components} />
              )}
              {activeVariant.key === 'limit-horizon' && (
                <LimitHorizonView
                  project={project}
                  customer={customer}
                  components={components}
                />
              )}
              {activeVariant.key === 'period-over-period' && (
                <PeriodOverPeriodView
                  project={project}
                  customer={customer}
                  components={components}
                />
              )}
            </>
          )}
        </Panel>
      </Col>
    </Row>
  );
};
