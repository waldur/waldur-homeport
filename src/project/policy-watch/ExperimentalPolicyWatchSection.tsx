import { FC, useState } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { TraceabilityPopover } from '@/marketplace/aggregate-limits/experimental/TraceabilityPopover';
import { Project } from '@/workspace/types';

import { PolicyWatchVariant } from './types';
import { usePolicyWatchData } from './usePolicyWatchData';
import { BreakdownView } from './views/BreakdownView';
import { MatrixView } from './views/MatrixView';
import { SpendView } from './views/SpendView';

interface VariantInfo {
  key: PolicyWatchVariant;
  label: string;
  hint: string;
}

const VARIANTS: VariantInfo[] = [
  // Health is now a first-class block (ProjectCreditHealthBlock), shown whenever
  // the project has a credit — no longer a tab here.
  {
    key: 'spend',
    label: translate('Spend'),
    hint: translate(
      'Credit burn-down with projected exhaustion line, plus monthly spend forecast with P10/P50/P90 confidence band.',
    ),
  },
  {
    key: 'breakdown',
    label: translate('Breakdown'),
    hint: translate(
      'Where the current-month spend is going, sorted by line item.',
    ),
  },
  {
    key: 'matrix',
    label: translate('Matrix'),
    hint: translate(
      'Dense table: one row per active policy with threshold, current saturation, action and ETA.',
    ),
  },
];

interface Props {
  project: Project;
}

export const ExperimentalPolicyWatchSection: FC<Props> = ({ project }) => {
  const [variant, setVariant] = useState<PolicyWatchVariant>('spend');
  const data = usePolicyWatchData(project);

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
              <strong>{translate('Spending & limits watch')}</strong>
              <TraceabilityPopover
                id="policy-watch-overview"
                title={translate('Section overview')}
                rows={[
                  {
                    label: translate('Why this section exists'),
                    value: translate(
                      'Consolidates cost-policy, SLURM-periodic-policy, credit and per-resource state so users can answer "why was my resource paused?" and "when will it be paused?" without hopping between widgets.',
                    ),
                  },
                  {
                    label: translate('Feature flag'),
                    value:
                      'MarketplaceFeatures.show_experimental_ui_components — checked via isExperimentalUiComponentsVisible() (src/marketplace/utils.ts).',
                  },
                  {
                    label: translate('Endpoints composed client-side'),
                    value: [
                      'GET /api/marketplace-project-estimated-cost-policies/?scope_uuid={project}',
                      'GET /api/marketplace-customer-estimated-cost-policies/?scope_uuid={customer}',
                      'GET /api/marketplace-slurm-periodic-usage-policies/?scope_uuid={offering}',
                      'GET /api/marketplace-slurm-periodic-usage-policies/{uuid}/evaluation_logs/',
                      'GET /api/marketplace-resources/?project_uuid={project}',
                      'GET /api/project-credits/?project_uuid={project}',
                      'GET /api/customer-credits/?customer_uuid={customer}',
                    ].join('\n'),
                  },
                  {
                    label: translate('Per-resource attribution'),
                    value:
                      'Resource.attributes._policy_attribution.{paused,downscaled} — written by waldur_mastermind/policy/policy_actions.py:_save_resource_with_reversion when a pause/downscale action fires.',
                  },
                ]}
              />
            </div>
            <Nav
              variant="pills"
              className="flex-wrap gap-1"
              activeKey={variant}
              onSelect={(k) => k && setVariant(k as PolicyWatchVariant)}
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
        {data.isLoading ? (
          <LoadingSpinner />
        ) : data.hasError ? (
          <div className="alert alert-warning">
            {translate('Failed to load policy watch data.')}
          </div>
        ) : (
          <>
            {variant === 'spend' && <SpendView data={data} />}
            {variant === 'breakdown' && <BreakdownView data={data} />}
            {variant === 'matrix' && <MatrixView data={data} />}
          </>
        )}
      </Col>
    </Row>
  );
};
