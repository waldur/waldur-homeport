import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  ProposalChangeRequest,
  proposalProposalsRetrieve,
} from 'waldur-js-client';

import { AlertItem, Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import {
  ROW_SECTIONS_CLASS,
  RoundCutoff,
  RowSection,
} from '@/proposals/ExpandableRowParts';
import { formatPrepaidMonths } from '@/proposals/prepaidDuration';
import { showsWorkflowSteps } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';
import { formatProposalState } from '@/proposals/utils';
import {
  fetchProposalWorkflowStates,
  proposalWorkflowStatesKey,
} from '@/proposals/workflow/queries';
import { activeStepsOf, isConditionSkipped } from '@/proposals/workflow/stages';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getApplicantTimeline } from './applicantTimeline';
import { AwardChangeBadge } from './AwardComparison';
import { getOpenChangeRequests } from './changeRequests';
import {
  canRequestExtension,
  POST_AWARD_SECTION_ID,
  postAwardStatusLabel,
  runPhaseLabel,
} from './postAward';

/**
 * The proposal page's own query. The list asks only for its columns' fields:
 * what the expanded row reads -- the submission verdict and the compliance
 * status among them, computed per proposal -- is fetched for the one
 * proposal when its row is opened, and the page then opens from the cache.
 * The detail endpoint takes no field selection, so this is the whole
 * proposal, the very payload the page loads.
 */
const proposalKey = (proposalUuid: string) => ['Proposal', proposalUuid];

const PROPOSAL_STATE = 'proposals.manage-proposal';

const MutedLine: FC<{ text: string }> = ({ text }) => (
  <p className="text-quaternary mb-0">{text}</p>
);

const earliestDue = (requests: ProposalChangeRequest[]) =>
  requests
    .map((request) => request.due_at)
    .filter((due): due is string => Boolean(due))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

/** The changes asked of the applicant, with the way to the reopened form. */
const ChangesRequestedCallout: FC<{
  proposal: Proposal;
  requests: ProposalChangeRequest[];
}> = ({ proposal, requests }) => {
  const single = requests.length === 1;
  const due = earliestDue(requests);
  return (
    <AlertItem
      variant="warning"
      type="floating"
      iconSize="md"
      role="status"
      data-testid="changes-requested-callout"
      title={
        single
          ? translate('Changes requested at {step}', {
              step: requests[0].step_name,
            })
          : translate('Changes requested at {count} steps', {
              count: requests.length,
            })
      }
      body={
        due
          ? single
            ? translate('Submit the changes by {date}.', {
                date: formatDateTime(due),
              })
            : translate(
                'Submit all the changes together, by {date} at the latest.',
                { date: formatDateTime(due) },
              )
          : single
            ? translate('Submit the changes once they are made.')
            : translate('Submit all the changes together once they are made.')
      }
      actions={
        <Link
          state={PROPOSAL_STATE}
          params={{ proposal_uuid: proposal.uuid }}
          label={translate('Make the changes')}
          buttonVariant="primary"
          buttonSize="sm"
          className="whitespace-nowrap"
        />
      }
    />
  );
};

/**
 * What the applicant's tracker calls the stage the proposal is at: the labels
 * the call configured for the viewer, which the list already carries; else
 * the current steps as the tracker names them for the applicant, an internal
 * step standing under the name of its stage; else the proposal's state.
 */
const useApplicantStage = (proposal: Proposal): string[] => {
  const labels = useMemo(
    () =>
      (proposal.status_labels ?? [])
        .map((entry) => entry.label)
        .filter(Boolean),
    [proposal.status_labels],
  );
  // The proposal page's own query: opening the proposal afterwards reads it
  // from the cache. Only asked for when the list row cannot name the stage.
  const needsSteps =
    !labels.length && Boolean(proposal.workflow_step) && showsWorkflowSteps();
  const { data } = useQuery({
    queryKey: proposalWorkflowStatesKey(proposal.uuid),
    queryFn: () => fetchProposalWorkflowStates(proposal.uuid),
    enabled: needsSteps,
  });
  return useMemo(() => {
    if (labels.length) return labels;
    if (needsSteps && data) {
      const live = data.filter(
        (step) => step.status !== 'skipped' || isConditionSkipped(step),
      );
      const names = activeStepsOf(getApplicantTimeline(live)).map(
        (step) => step.step_name,
      );
      if (names.length) return Array.from(new Set(names));
    }
    return [formatProposalState(proposal.state)];
  }, [labels, needsSteps, data, proposal.state]);
};

const DraftDetails: FC<{ proposal: Proposal }> = ({ proposal }) => {
  const verdict = proposal.can_submit;
  const compliance = proposal.compliance_status;
  const unanswered = compliance?.unanswered_required_count ?? 0;
  // The backend refuses submission with required compliance questions
  // unanswered; until every deployment says so itself, the row does not call
  // such a proposal ready.
  const ready = verdict?.can_submit && !unanswered;
  return (
    <RowSection title={translate('Before you submit')}>
      <PropertyList variant="summary" space={1.5}>
        {verdict ? (
          <PropertyItem label={translate('Readiness')}>
            {ready ? (
              <Badge
                variant="success"
                shape="pill"
                tone="outline"
                className="me-1.5"
              >
                {translate('Ready to submit')}
              </Badge>
            ) : (
              <>
                <Badge
                  variant="warning"
                  shape="pill"
                  tone="outline"
                  className="me-1.5 text-warning"
                >
                  {translate('Not ready yet')}
                </Badge>
                {verdict.error}
              </>
            )}
          </PropertyItem>
        ) : null}
        {compliance?.has_checklist ? (
          <PropertyItem label={translate('Compliance checklist')}>
            {compliance.is_completed
              ? translate('Complete')
              : translate('{percentage}% complete', {
                  percentage: compliance.completion_percentage || 0,
                })}
            {!compliance.is_completed && unanswered > 0 && (
              <span className="text-quaternary ms-1">
                {unanswered === 1
                  ? translate('(1 required question unanswered)')
                  : translate('({count} required questions unanswered)', {
                      count: unanswered,
                    })}
              </span>
            )}
          </PropertyItem>
        ) : null}
        {proposal.round ? (
          <PropertyItem label={translate('Round deadline')}>
            <RoundCutoff round={proposal.round} />
          </PropertyItem>
        ) : null}
        <PropertyItem
          label={translate('Summary')}
          value={proposal.project_summary}
          valueClass="whitespace-pre-line"
        />
      </PropertyList>
    </RowSection>
  );
};

const InReviewDetails: FC<{ proposal: Proposal }> = ({ proposal }) => {
  const stage = useApplicantStage(proposal);
  // The row's only section: plain key/value rows, no heading over them.
  return (
    <PropertyList variant="summary" space={1.5}>
      <PropertyItem
        label={translate('Current stage')}
        value={propVal.list(stage)}
      />
      <PropertyItem label={translate('Panel')} value={proposal.panel_name} />
    </PropertyList>
  );
};

/** The post-award work and where each piece of it is acted on. */
const PostAwardDetails: FC<{ proposal: Proposal }> = ({ proposal }) => {
  const extensionOpen = canRequestExtension(proposal, true);
  const reportOpenable =
    proposal.final_report_openable && !proposal.open_run_uuid;
  if (
    !proposal.post_award_status &&
    !proposal.open_run_uuid &&
    !extensionOpen &&
    !reportOpenable
  ) {
    return null;
  }
  return (
    <RowSection
      title={translate('After the award')}
      data-testid="proposal-row-post-award"
    >
      <PropertyList variant="summary" space={1.5}>
        {proposal.post_award_status ? (
          <PropertyItem
            label={translate('Status')}
            value={postAwardStatusLabel(proposal.post_award_status)}
          />
        ) : null}
        {proposal.open_run_uuid ? (
          <PropertyItem
            label={translate('In progress')}
            value={
              proposal.open_run_phase
                ? runPhaseLabel(proposal.open_run_phase)
                : translate('Post-award request')
            }
          />
        ) : null}
        {extensionOpen ? (
          <PropertyItem
            label={translate('Extension')}
            value={translate('Can be requested until {date}', {
              date: formatDate(proposal.extension_requestable_until),
            })}
          />
        ) : null}
        {reportOpenable ? (
          <PropertyItem
            label={translate('Final report')}
            value={translate('Can be opened now')}
          />
        ) : null}
      </PropertyList>
      <div>
        <Link
          state={PROPOSAL_STATE}
          params={{ proposal_uuid: proposal.uuid, '#': POST_AWARD_SECTION_ID }}
          label={translate('Go to post-award work')}
          buttonVariant="tertiary"
        />
      </div>
    </RowSection>
  );
};

const AcceptedDetails: FC<{ proposal: Proposal }> = ({ proposal }) => {
  const awarded = proposal.awarded_duration_months;
  const requested = proposal.requested_duration_months;
  // As the award comparison: called out only where it differs.
  const differs = Boolean(awarded && requested && awarded !== requested);
  const projectUuid = getUUID(proposal.project);
  return (
    <>
      <RowSection title={translate('Award')}>
        <PropertyList variant="summary" space={1.5}>
          {awarded ? (
            <PropertyItem label={translate('Awarded duration')}>
              {formatPrepaidMonths(awarded)}
              {differs && (
                <>
                  <span className="text-quaternary mx-1.5">
                    {translate('Requested: {duration}', {
                      duration: formatPrepaidMonths(requested),
                    })}
                  </span>
                  <AwardChangeBadge change="changed" />
                </>
              )}
            </PropertyItem>
          ) : null}
          <PropertyItem
            label={translate('Project')}
            value={
              projectUuid ? (
                <Link
                  state="project.dashboard"
                  params={{ uuid: projectUuid }}
                  label={proposal.project_name || translate('Open the project')}
                />
              ) : null
            }
          />
        </PropertyList>
        {!awarded && !projectUuid ? (
          <MutedLine text={translate('The award is being set up.')} />
        ) : null}
      </RowSection>
      <PostAwardDetails proposal={proposal} />
    </>
  );
};

const ClosedDetails: FC<{ proposal: Proposal }> = ({ proposal }) => (
  <RowSection title={translate('Decision')}>
    {proposal.allocation_comment ? (
      <PropertyList variant="summary" space={1.5}>
        <PropertyItem
          label={translate('Comment')}
          value={proposal.allocation_comment}
          valueClass="whitespace-pre-line"
        />
      </PropertyList>
    ) : (
      <MutedLine text={translate('No comment was shared with the decision.')} />
    )}
  </RowSection>
);

/** When the proposal was started and when it left draft. */
const ProposalDates: FC<{ proposal: Proposal }> = ({ proposal }) => (
  <RowSection title={translate('Dates')}>
    <PropertyList variant="summary" space={1.5}>
      <PropertyItem
        label={translate('Created')}
        value={propVal.date(proposal.created, { precision: 'datetime' })}
      />
      <PropertyItem
        label={translate('Submitted')}
        value={propVal.date(proposal.submitted_at, { precision: 'datetime' })}
      />
    </PropertyList>
  </RowSection>
);

/**
 * An applicant's proposal, opened in their list: what is missing before a
 * draft can go, where a submitted one stands and whether it waits on them,
 * what an accepted one was awarded, and why a closed one ended. Reads the
 * list row only, except to name a stage the call gave no label.
 */
export const UserProposalExpandableRow: FC<{ row: Proposal }> = ({ row }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: proposalKey(row.uuid),
    queryFn: () =>
      proposalProposalsRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  const proposal = useMemo(
    () => (data ? ({ ...row, ...data } as Proposal) : undefined),
    [row, data],
  );
  const changeRequests = getOpenChangeRequests(proposal);
  return (
    <ExpandableContainer>
      {isLoading ? (
        <LoadingSpinner />
      ) : isError || !proposal ? (
        <MutedLine text={translate('Unable to load the details.')} />
      ) : (
        <div className={ROW_SECTIONS_CLASS}>
          {changeRequests.length ? (
            <ChangesRequestedCallout
              proposal={proposal}
              requests={changeRequests}
            />
          ) : null}
          {proposal.state === 'draft' ? (
            <DraftDetails proposal={proposal} />
          ) : proposal.state === 'submitted' ||
            proposal.state === 'in_review' ? (
            <InReviewDetails proposal={proposal} />
          ) : proposal.state === 'accepted' ? (
            <AcceptedDetails proposal={proposal} />
          ) : (
            <ClosedDetails proposal={proposal} />
          )}
          <ProposalDates proposal={proposal} />
        </div>
      )}
    </ExpandableContainer>
  );
};
