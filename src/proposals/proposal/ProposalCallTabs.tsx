import Markdown from 'markdown-to-jsx';
import { FC, useCallback, useMemo, useRef } from 'react';
import {
  NestedRequestedOffering,
  ProposalWorkflowStepInstance,
  PublicCall,
} from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CALL_STATE_VARIANT } from '../call-tabs';
import { CallDetailsRows } from '../details/CallDetailsFields';
import { CallDocumentsCard } from '../details/CallDocumentsCard';
import { EndingField } from '../EndingField';
import { continuouslyOpenLabel, isOpenEnded } from '../roundCutoff';
import { Proposal } from '../types';
import { formatCallState } from '../utils';

/** The call as its public page presents it. */
export const CallTab: FC<{ call: PublicCall }> = ({ call }) => (
  <PropertyList variant="summary" space={2.5}>
    <PropertyItem label={translate('Name')} value={call.name} />
    <PropertyItem
      label={translate('Managing organization')}
      value={call.customer_name}
      hideIfEmpty={false}
    />
    <PropertyItem
      label={translate('State')}
      value={
        <Badge
          variant={CALL_STATE_VARIANT[call.state] || 'secondary'}
          shape="pill"
          tone="outline"
        >
          {formatCallState(call.state)}
        </Badge>
      }
    />
    {/* Reference code, publication date and project duration -- with the
        longest prepaid subscription it allows -- as the public call page
        states them. */}
    <CallDetailsRows call={call} />
    <PropertyItem
      label={translate('Closes')}
      value={
        call.rounds?.some(isOpenEnded)
          ? continuouslyOpenLabel()
          : propVal.date(call.end_date, { precision: 'datetime' })
      }
      hideIfEmpty={false}
    />
    {call.external_url ? (
      <PropertyItem
        label={translate('More information')}
        value={
          <ExternalLink url={call.external_url} label={call.external_url} />
        }
      />
    ) : null}
    {call.description ? (
      <PropertyItem
        label={translate('Description')}
        value={<Markdown>{call.description}</Markdown>}
      />
    ) : null}
  </PropertyList>
);

interface OfferingRow {
  uuid: string;
  offering: string;
  provider: string;
  plan?: string;
  components: string;
  templates: string;
}

const toOfferingRow = (
  call: PublicCall,
  offering: NestedRequestedOffering,
): OfferingRow => ({
  uuid: offering.uuid,
  offering: offering.offering_name,
  provider: offering.provider_name,
  plan: offering.plan_details?.name,
  components: (offering.components ?? [])
    .map((component) => component.name)
    .join(', '),
  templates: (call.resource_templates ?? [])
    .filter((template) => template.requested_offering_uuid === offering.uuid)
    .map((template) => template.name)
    .join(', '),
});

/** The offerings the call's providers have confirmed for it. */
export const OfferingsTab: FC<{
  call: PublicCall;
}> = ({ call }) => {
  const rows = useMemo(
    () =>
      (call.offerings ?? []).map((offering) => toOfferingRow(call, offering)),
    [call],
  );
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const version = rows.map((row) => row.uuid).join('|');
  const filter = useMemo(() => ({ version }), [version]);
  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: rowsRef.current,
        resultCount: rowsRef.current.length,
      }),
    [],
  );
  const tableProps = useTable({
    table: `ProposalCallOfferings-${call.uuid}`,
    fetchData,
    filter,
  });
  return (
    // No frame of its own, nor the dialog's around its rows: the tab is
    // the frame.
    <div className="[&_.table-responsive]:border-0">
      <Table<OfferingRow>
        {...tableProps}
        cardBordered={false}
        bodyClassName="p-0"
        title={null}
        hasActionBar={false}
        hideRefresh
        placeholderHasRetry={false}
        minHeight="auto"
        verboseName={translate('offerings')}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <span className="font-medium text-primary">{row.offering}</span>
            ),
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{renderFieldOrDash(row.provider)}</>,
          },
          {
            // The plan with what it sells, and the call's templates for it,
            // in one column so the table fits the dialog.
            title: translate('Plan'),
            render: ({ row }) => (
              <div className="flex flex-col">
                <span>{renderFieldOrDash(row.plan)}</span>
                {row.components ? (
                  <span className="text-quaternary">{row.components}</span>
                ) : null}
                {row.templates ? (
                  <span className="text-quaternary">
                    {translate('Templates: {names}', { names: row.templates })}
                  </span>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

/** The call's documents, for download. */
export const DocumentsTab: FC<{ call: PublicCall }> = ({ call }) => (
  // The dialog frames every table; the tab already names and frames this one.
  <div className="[&_.table-responsive]:border-0">
    <CallDocumentsCard
      call={call}
      rowActions={undefined}
      tableActions={null}
      embedded
    />
  </div>
);

/** The round the proposal was submitted to. */
export const RoundTab: FC<{ call?: PublicCall; proposal: Proposal }> = ({
  call,
  proposal,
}) => {
  const round = proposal.round;
  return (
    <PropertyList variant="summary" space={2.5} hideIfEmpty={false}>
      <PropertyItem label={translate('Name')} value={round?.name} />
      <PropertyItem label={translate('Reference code')} value={round?.slug} />
      <PropertyItem
        label={translate('Opens')}
        value={propVal.date(round?.start_time, { precision: 'datetime' })}
      />
      <PropertyItem
        label={translate('Cutoff date')}
        value={
          round?.cutoff_time ? (
            <EndingField endDate={round.cutoff_time} dateFirst />
          ) : isOpenEnded(round) ? (
            continuouslyOpenLabel()
          ) : null
        }
      />
      <PropertyItem
        label={translate('Allocation date')}
        value={propVal.date(round?.allocation_date)}
      />
      {call ? (
        <PropertyItem
          label={translate('Results')}
          value={
            call.publish_results === 'with_round'
              ? translate('Published for the whole round at once')
              : translate('Published as soon as each decision is made')
          }
        />
      ) : null}
    </PropertyList>
  );
};

/**
 * How the call evaluates a proposal, in plain words: when evaluation starts,
 * what the applicant sees of the reviews, and the steps where the applicant
 * acts.
 */
export const EvaluationTab: FC<{
  call: PublicCall;
  workflowStates?: ProposalWorkflowStepInstance[];
}> = ({ call, workflowStates }) => {
  const applicantSteps = (workflowStates ?? [])
    .filter((step) => step.kind === 'applicant_action')
    .sort((a, b) => a.order - b.order);
  const reviewsVisible = Boolean(call.reviews_visible_to_submitters);
  return (
    <ul className="flex flex-col gap-2.5 ps-4 mb-0">
      <li>
        {call.evaluation_start === 'at_cutoff'
          ? translate(
              'Evaluation starts when the round closes at its cutoff, for all its proposals together.',
            )
          : translate('Evaluation starts as soon as a proposal is submitted.')}
      </li>
      <li>
        {reviewsVisible
          ? call.reviewer_identity_visible_to_submitters
            ? translate(
                'The applicant sees the reviews of their proposal, with the reviewers named.',
              )
            : translate(
                'The applicant sees the reviews of their proposal; the reviewers stay anonymous.',
              )
          : translate('The applicant does not see the reviews.')}
      </li>
      <li>
        {applicantSteps.length
          ? translate('The applicant acts at these steps: {steps}.', {
              steps: applicantSteps.map((step) => step.step_name).join(', '),
            })
          : translate('The applicant has no step to act on after submitting.')}
      </li>
    </ul>
  );
};
