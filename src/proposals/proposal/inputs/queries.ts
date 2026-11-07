import { useQuery } from '@tanstack/react-query';
import {
  proposalProposalsReleasedReportsList,
  proposalProposalsStepInputsList,
  ProposalWorkflowStepInstance,
  ReleasedReport,
  StepInput,
} from 'waldur-js-client';

/** A refused read: the viewer holds no work on the step, nothing to show. */
const isRefused = (error: any) =>
  (error?.response?.status ?? error?.status) === 403;

export const stepInputsKey = (proposalUuid: string, stepUuid: string) =>
  ['ProposalStepInputs', proposalUuid, stepUuid] as const;

export const releasedReportsKey = (proposalUuid: string) =>
  ['ProposalReleasedReports', proposalUuid] as const;

/**
 * What the input steps of one of the proposal's steps produced, as the
 * viewer may read it. Null when the viewer holds no work on the step: the
 * backend refuses, and there is nothing to show.
 */
export const stepInputsQuery = (proposalUuid: string, stepUuid: string) => ({
  queryKey: stepInputsKey(proposalUuid, stepUuid),
  queryFn: (): Promise<StepInput[] | null> =>
    proposalProposalsStepInputsList({
      path: { uuid: proposalUuid },
      query: { step_uuid: stepUuid },
    })
      .then((response) => response.data ?? [])
      .catch((error) => {
        if (isRefused(error)) return null;
        throw error;
      }),
  refetchOnWindowFocus: false,
});

export const useStepInputs = (proposalUuid: string, stepUuid: string) =>
  useQuery<StepInput[] | null>(stepInputsQuery(proposalUuid, stepUuid));

/** The reports released to the applicant; empty for anyone else. */
export const useReleasedReports = (proposalUuid: string) =>
  useQuery<ReleasedReport[]>({
    queryKey: releasedReportsKey(proposalUuid),
    queryFn: () =>
      proposalProposalsReleasedReportsList({ path: { uuid: proposalUuid } })
        .then((response) => response.data ?? [])
        .catch((error) => {
          if (isRefused(error)) return [];
          throw error;
        }),
    refetchOnWindowFocus: false,
  });

const STARTED = ['active', 'completed', 'expired'];

/**
 * The steps whose inputs are shown on the proposal: every step that reads
 * earlier steps once it has started -- the response to reviews, the step
 * running now and those done -- and every applicant step, which is where
 * the applicant acts on it even when it reads nothing. Whether the viewer
 * may read them is the backend's to say: it refuses whoever held no work on
 * the step.
 */
export const stepsShowingInputs = (
  steps: ProposalWorkflowStepInstance[] | undefined,
): ProposalWorkflowStepInstance[] =>
  (steps ?? []).filter(
    (step) =>
      ((step.input_step_uuids ?? []).length > 0 || isResponseStep(step)) &&
      STARTED.includes(step.status),
  );

/**
 * Whether the step is the offering team's work: its contributors are the
 * requested offerings' teams, or its offering managers complete it. The only
 * steps a provider reading just its offerings' part holds work on.
 */
export const isOfferingTeamStep = (
  step: Pick<ProposalWorkflowStepInstance, 'contributor_source' | 'completer'>,
): boolean =>
  step.contributor_source === 'requested_offering_team' ||
  step.completer === 'offering_manager';

/**
 * A step the applicant completes by submitting: a response to what earlier
 * steps produced, or a plain submission reading nothing. The award response
 * is answered with its own actions.
 */
export const isResponseStep = (
  step: Pick<ProposalWorkflowStepInstance, 'kind' | 'outcome_set'>,
) => step.kind === 'applicant_action' && step.outcome_set !== 'acceptance';

/** Whether the step reads what earlier steps produced. */
export const readsInputs = (
  step: Pick<ProposalWorkflowStepInstance, 'input_step_uuids'>,
) => (step.input_step_uuids ?? []).length > 0;

/**
 * The steps the applicant team reads through a response step rather than as
 * contribution cards of their own. Only a response step shows its inputs to
 * the applicant; a step read by an evaluator-only step (the rapporteurs'
 * reports, say) shows the applicant nothing of it, so its own cards stay.
 */
export const stepsReadThroughResponse = (
  steps: ProposalWorkflowStepInstance[] | undefined,
): string[] =>
  stepsShowingInputs(steps)
    .filter(isResponseStep)
    .flatMap((step) => step.input_step_uuids ?? []);

/**
 * The steps the applicant team reads elsewhere on the page than as
 * contribution cards of their own: through the step responding to them, or
 * as a report released to them under "Feedback to the applicant". Listed
 * again as contributions, a released report would show twice.
 */
export const stepsReadByApplicantElsewhere = (
  steps: ProposalWorkflowStepInstance[] | undefined,
): string[] => [
  ...stepsReadThroughResponse(steps),
  ...(steps ?? [])
    .filter((step) => step.released_at)
    .map((step) => step.call_step_uuid),
];

/** Completed steps whose report the viewer may release now. */
export const releasableSteps = (
  steps: ProposalWorkflowStepInstance[] | undefined,
): ProposalWorkflowStepInstance[] =>
  (steps ?? []).filter((step) => step.can_release);

/**
 * Whether a step's inputs card is on the page: once they have loaded, or
 * failed to. A refused read (null) shows nothing.
 */
export const showsStepInputs = ({
  data,
  isError,
}: {
  data: StepInput[] | null | undefined;
  isError: boolean;
}) => Boolean(data) || isError;

/** The released reports' steps still to be released by the viewer. */
export const pendingReleases = (releasable: ProposalWorkflowStepInstance[]) =>
  releasable.filter((step) => !step.released_at);

/**
 * Whether the released reports section is on the page: a report released,
 * one the viewer may still release, or a failure to say which.
 */
export const showsReleasedReports = ({
  reports,
  isError,
  releasable,
}: {
  reports: ReleasedReport[] | undefined;
  isError: boolean;
  releasable: ProposalWorkflowStepInstance[];
}) =>
  Boolean(reports?.length) || pendingReleases(releasable).length > 0 || isError;
