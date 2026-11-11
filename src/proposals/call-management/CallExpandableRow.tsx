import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalProposalsList } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { formatAmount } from '@/proposals/budgets';
import {
  ROW_SECTIONS_CLASS,
  RoundCutoff,
  RowSection,
} from '@/proposals/ExpandableRowParts';
import { Call } from '@/proposals/types';
import { useCallResourcePoolUsage } from '@/proposals/update/resource-pools/queries';
import { summaryText } from '@/proposals/workflow-check/findings';
import { CALL_VALIDATION_STATE } from '@/proposals/workflow-check/WorkflowCheckPanel';
import {
  useCallWorkflowCheck,
  useCallWorkflowProgress,
} from '@/proposals/workflow-description/queries';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import {
  countOfferings,
  countPools,
  pickCurrentRound,
  PoolSummary,
  stepsInFlight,
  summarisePools,
} from './callRowSummary';

/** The overdue count on a step. */
const OverdueBadge: FC<{ count: number }> = ({ count }) => (
  <Badge
    variant="danger"
    size="sm"
    shape="pill"
    tone="outline"
    className="ms-1.5"
  >
    {translate('{count} overdue', { count })}
  </Badge>
);

const PoolLines: FC<{ pools: PoolSummary[] }> = ({ pools }) => (
  <>
    {pools.map((pool) => (
      <PropertyItem key={pool.key} label={pool.component}>
        {pool.offered === null
          ? translate('{awarded} awarded', {
              awarded: formatAmount(pool.awarded, pool.unit),
            })
          : translate('{awarded} of {offered} awarded', {
              awarded: formatAmount(pool.awarded),
              offered: formatAmount(pool.offered, pool.unit),
            })}
        {pool.remaining !== null && (
          <span
            className={pool.remaining < 0 ? 'text-danger' : 'text-quaternary'}
          >
            {' · '}
            {translate('{remaining} left', {
              remaining: formatAmount(pool.remaining),
            })}
          </span>
        )}
        <div className="text-quaternary text-xs">{pool.offering}</div>
      </PropertyItem>
    ))}
  </>
);

/** Whether a draft call is ready to open: the check's verdict and its setup. */
const DraftCallDetails: FC<{ call: Call }> = ({ call }) => {
  const { data: check, isLoading } = useCallWorkflowCheck(call.uuid);
  const { data: usage } = useCallResourcePoolUsage(call.uuid);
  const offerings = countOfferings(call.offerings);
  const pools = countPools(usage);
  const findings = check ? summaryText(check.summary) : null;
  const templateNewer =
    call.template_latest_version != null &&
    call.template_version != null &&
    call.template_latest_version > call.template_version;

  return (
    <div className={ROW_SECTIONS_CLASS}>
      <RowSection title={translate('Readiness')}>
        {isLoading ? (
          <LoadingSpinner />
        ) : check ? (
          <PropertyList variant="summary" space={1.5}>
            {/* One row, in a list so its label lines up with the other
                sections'. */}
            {/* eslint-disable-next-line waldur-custom/no-lone-property-item-in-list */}
            <PropertyItem label={translate('Workflow check')}>
              <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Badge
                  variant={check.can_activate ? 'success' : 'danger'}
                  shape="pill"
                  tone="outline"
                  data-testid="workflow-check-verdict"
                >
                  {check.can_activate
                    ? findings
                      ? translate('Can be activated · {findings}', { findings })
                      : translate('Can be activated')
                    : findings}
                </Badge>
                <Link
                  state={CALL_VALIDATION_STATE}
                  params={{ call_uuid: call.uuid }}
                  label={translate('Open validation')}
                  className="whitespace-nowrap"
                />
              </span>
            </PropertyItem>
          </PropertyList>
        ) : null}
      </RowSection>
      <RowSection title={translate('Setup')}>
        <PropertyList variant="summary" space={1.5}>
          <PropertyItem
            label={translate('Rounds')}
            value={
              call.rounds?.length
                ? String(call.rounds.length)
                : translate('None yet')
            }
          />
          <PropertyItem
            label={translate('Offerings')}
            value={
              !offerings.total
                ? translate('None yet')
                : offerings.pending
                  ? translate('{total}, {pending} awaiting provider approval', {
                      total: offerings.total,
                      pending: offerings.pending,
                    })
                  : String(offerings.total)
            }
          />
          {usage ? (
            <PropertyItem
              label={translate('Resource pools')}
              value={
                pools
                  ? translate('{count} defined', { count: pools })
                  : translate('None defined')
              }
            />
          ) : null}
          {call.template_name ? (
            <PropertyItem label={translate('Created from template')}>
              {call.template_version != null
                ? translate('{name}, version {version}', {
                    name: call.template_name,
                    version: call.template_version,
                  })
                : call.template_name}
              {templateNewer && (
                <span className="text-quaternary ms-1">
                  {translate('(version {latest} is out)', {
                    latest: call.template_latest_version,
                  })}
                </span>
              )}
            </PropertyItem>
          ) : null}
        </PropertyList>
      </RowSection>
    </div>
  );
};

/** Where an active call's work stands and what is late. */
const ActiveCallDetails: FC<{ call: Call }> = ({ call }) => {
  const currentRound = useMemo(() => pickCurrentRound(call.rounds), [call]);
  const { data: progress, isLoading } = useCallWorkflowProgress(
    call.uuid,
    null,
  );
  const { data: usage } = useCallResourcePoolUsage(call.uuid);
  const steps = stepsInFlight(progress);
  const pools = summarisePools(usage);

  return (
    <div className={ROW_SECTIONS_CLASS}>
      <RowSection title={translate('Round')}>
        <PropertyList variant="summary" space={1.5}>
          <PropertyItem
            label={translate('Current round')}
            value={
              currentRound ? currentRound.name : translate('No open round')
            }
          />
          {currentRound ? (
            <PropertyItem label={translate('Next cutoff')}>
              <RoundCutoff round={currentRound} />
            </PropertyItem>
          ) : null}
        </PropertyList>
      </RowSection>
      {isLoading ? (
        <LoadingSpinner />
      ) : progress ? (
        <RowSection
          title={translate('Proposals in the workflow')}
          data-testid="call-row-workflow"
        >
          <PropertyList variant="summary" space={1.5}>
            <PropertyItem
              label={translate('Proposals')}
              value={String(progress.proposals)}
            />
            <PropertyItem label={translate('Waiting at')}>
              {steps.length ? (
                <ul className="list-unstyled mb-0">
                  {steps.map((step) => (
                    <li key={step.key} className="mb-1">
                      {translate('{count} at {step}', {
                        count: step.waiting,
                        step: step.name,
                      })}
                      {step.overdue > 0 && (
                        <OverdueBadge count={step.overdue} />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                translate('No proposal is waiting at a step.')
              )}
            </PropertyItem>
          </PropertyList>
        </RowSection>
      ) : null}
      {pools.length ? (
        <RowSection
          title={translate('Resource pools')}
          data-testid="call-row-pools"
        >
          <PropertyList variant="summary" space={1.5}>
            <PoolLines pools={pools} />
          </PropertyList>
        </RowSection>
      ) : null}
    </div>
  );
};

const useDecidedCount = (callUuid: string, state: 'accepted' | 'rejected') =>
  useQuery({
    queryKey: ['CallExpandableRow', 'decided', callUuid, state],
    queryFn: () =>
      proposalProposalsList({
        query: { call_uuid: callUuid, state: [state], page_size: 1 },
      }).then(fetchResultCount),
    refetchOnWindowFocus: false,
  });

/** What an archived call decided and what it awarded. */
const ArchivedCallDetails: FC<{ call: Call }> = ({ call }) => {
  const accepted = useDecidedCount(call.uuid, 'accepted');
  const rejected = useDecidedCount(call.uuid, 'rejected');
  const { data: usage } = useCallResourcePoolUsage(call.uuid);
  const pools = summarisePools(usage, true);

  return (
    <div className={ROW_SECTIONS_CLASS}>
      <RowSection title={translate('Decisions')}>
        {accepted.isLoading || rejected.isLoading ? (
          <LoadingSpinner />
        ) : (
          <PropertyList variant="summary" space={1.5}>
            <PropertyItem
              label={translate('Accepted')}
              value={String(accepted.data ?? 0)}
            />
            <PropertyItem
              label={translate('Rejected')}
              value={String(rejected.data ?? 0)}
            />
          </PropertyList>
        )}
      </RowSection>
      {pools.length ? (
        <RowSection
          title={translate('Awarded resources')}
          data-testid="call-row-pools"
        >
          <PropertyList variant="summary" space={1.5}>
            <PoolLines pools={pools} />
          </PropertyList>
        </RowSection>
      ) : null}
    </div>
  );
};

/**
 * A call in the call managers' list, opened: whether a draft is ready to
 * open, where an active call's work stands, and what an archived one decided.
 * Mounted on expand, so nothing is fetched for a row left closed; the queries
 * are the call pages' own, which then open from the cache.
 */
export const CallExpandableRow: FC<{ row: Call }> = ({ row }) => (
  <ExpandableContainer>
    {row.state === 'draft' ? (
      <DraftCallDetails call={row} />
    ) : row.state === 'active' ? (
      <ActiveCallDetails call={row} />
    ) : (
      <ArchivedCallDetails call={row} />
    )}
  </ExpandableContainer>
);
