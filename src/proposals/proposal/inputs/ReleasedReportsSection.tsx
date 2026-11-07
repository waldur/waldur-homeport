import { ShareFatIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsReleaseStepReport,
  ProposalWorkflowStepInstance,
  ReleasedReport,
} from 'waldur-js-client';

import { AccordionCard, AlertItem, Badge, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';

import { sectionOpenProps, useSectionOpenState } from '../sectionOpen';

import {
  pendingReleases,
  releasedReportsKey,
  showsReleasedReports,
  useReleasedReports,
} from './queries';
import { ContributionOutput } from './StepInputsSection';

interface ReleaseFormValues {
  text?: string;
}

interface ReleaseReportDialogProps {
  resolve: {
    proposal: Proposal;
    step: ProposalWorkflowStepInstance;
    refetch?(): void;
  };
}

const ReleaseReportDialog: FC<ReleaseReportDialogProps> = ({
  resolve: { proposal, step, refetch },
}) => {
  const release = useManagedMutation<any, any, ReleaseFormValues>({
    mutationFn: (values) =>
      proposalProposalsReleaseStepReport({
        path: { uuid: proposal.uuid },
        body: {
          step_uuid: step.call_step_uuid,
          text: values.text?.trim() ?? '',
        },
      }),
    successMessage: translate('The report has been released to the applicant.'),
    errorMessage: translate('Unable to release the report.'),
    refetch,
    invalidateQueries: [
      { queryKey: proposalWorkflowStatesKey(proposal.uuid) },
      { queryKey: releasedReportsKey(proposal.uuid) },
    ],
  });
  return (
    <Form<ReleaseFormValues>
      onSubmit={(values) => release.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Release {step} to the applicant', {
              step: step.step_name,
            })}
            subtitle={translate(
              'The applicant reads the released report whatever the call says about showing reviews. It can be released once.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Release')}
                />
              </>
            }
          >
            <TextGroup
              name="text"
              label={translate('Edited text')}
              description={translate(
                'Optional. The applicant reads this text in place of the report as written.',
              )}
              rows={8}
              maxLength={20000}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};

const ReleasedReportBody: FC<{ report: ReleasedReport }> = ({ report }) => (
  <div className="flex flex-col gap-2.5" data-testid="released-report">
    <div className="flex flex-wrap items-center gap-2.5">
      <h5 className="mb-0">{report.step_name}</h5>
      <span className="text-quaternary text-xs">
        {report.released_by_name
          ? translate('Released {date} by {name}', {
              date: formatDateTime(report.released_at),
              name: report.released_by_name,
            })
          : translate('Released {date}', {
              date: formatDateTime(report.released_at),
            })}
      </span>
    </div>
    {report.text && (
      <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
        {report.text}
      </p>
    )}
    {report.contributions.map((contribution) => (
      <ContributionOutput key={contribution.uuid} contribution={contribution} />
    ))}
  </div>
);

interface ReleasedReportsSectionProps {
  proposal: Proposal;
  /**
   * Completed steps whose report the viewer may release: its completer, or
   * those overseeing the call, as the backend says.
   */
  releasable: ProposalWorkflowStepInstance[];
  refetch?(): void;
}

/**
 * The reports released to the applicant -- a consolidated report, final
 * feedback -- and, for the call manager, the steps whose report is still to
 * be released.
 */
export const ReleasedReportsSection: FC<ReleasedReportsSectionProps> = ({
  proposal,
  releasable,
  refetch,
}) => {
  const openState = useSectionOpenState();
  const { openDialog } = useModal();
  const { data: reports, isError } = useReleasedReports(proposal.uuid);
  const pending = pendingReleases(releasable);
  if (!showsReleasedReports({ reports, isError, releasable })) {
    return null;
  }
  return (
    <AccordionCard
      id="step-released-reports"
      title={translate('Feedback to the applicant')}
      subtitle={translate(
        'Reports released to the applicant, such as the consolidated report or final feedback.',
      )}
      {...sectionOpenProps(openState, 'step-released-reports', true)}
    >
      <div className="flex flex-col gap-5">
        {isError && (
          <AlertItem
            variant="error"
            type="floating"
            title={translate('Unable to load the released reports.')}
          />
        )}
        {pending.map((step) => (
          <div
            key={step.uuid}
            className="flex flex-wrap justify-between items-center gap-2.5"
          >
            <div className="flex items-center gap-2.5">
              <h5 className="mb-0">{step.step_name}</h5>
              <Badge variant="warning" tone="outline">
                {translate('Not released')}
              </Badge>
            </div>
            {/* Outline: the step's Complete is the page's one primary. */}
            <BaseButton
              variant="tertiary"
              label={translate('Release to applicant')}
              iconNode={<ShareFatIcon weight="bold" />}
              onClick={() =>
                openDialog(ReleaseReportDialog, {
                  resolve: { proposal, step, refetch },
                })
              }
            />
          </div>
        ))}
        {(reports ?? []).map((report) => (
          <ReleasedReportBody key={report.call_step_uuid} report={report} />
        ))}
      </div>
    </AccordionCard>
  );
};
