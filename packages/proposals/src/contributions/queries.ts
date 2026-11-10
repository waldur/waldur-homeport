import { useQuery } from '@tanstack/react-query';
import {
  OfferingAssessment,
  ProposalChangeRequest,
  proposalProposalsChangeRequestsList,
  proposalProposalsContributionsList,
  proposalProposalsOfferingAssessmentsList,
  proposalProposalsStepChecklistResponsesList,
  StepContributionWithAnswers,
} from 'waldur-js-client';

export const proposalContributionsKey = (proposalUuid: string) =>
  ['ProposalContributions', proposalUuid] as const;

/**
 * Every contribution to the proposal's steps the viewer may read. The
 * backend narrows the list -- a blind review shows a team only its own -- so
 * asking is safe for anyone who sees the proposal.
 */
export const useProposalContributions = (proposalUuid: string) =>
  useQuery({
    queryKey: proposalContributionsKey(proposalUuid),
    queryFn: () =>
      proposalProposalsContributionsList({ path: { uuid: proposalUuid } })
        .then((response) => response.data ?? [])
        .catch(() => []),
    refetchOnWindowFocus: false,
  });

/**
 * The contributions to one step with their form answers, keyed by
 * contribution. Only for a step that has a form.
 */
export const useStepContributionAnswers = (
  proposalUuid: string,
  stepUuid: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [...proposalContributionsKey(proposalUuid), 'answers', stepUuid],
    queryFn: () =>
      proposalProposalsStepChecklistResponsesList({
        path: { uuid: proposalUuid },
        query: { step_uuid: stepUuid },
      })
        .then((response) =>
          Object.fromEntries(
            (response.data ?? []).map((row) => [row.uuid, row]),
          ),
        )
        .catch(() => ({}) as Record<string, StepContributionWithAnswers>),
    refetchOnWindowFocus: false,
    enabled,
  });

/**
 * What the per-offering assessments concluded about each requested offering,
 * for the allocation decision. Empty for a viewer who may not read them.
 */
export const useOfferingAssessments = (proposalUuid: string, enabled = true) =>
  useQuery<OfferingAssessment[]>({
    queryKey: [...proposalContributionsKey(proposalUuid), 'offerings'],
    queryFn: () =>
      proposalProposalsOfferingAssessmentsList({
        path: { uuid: proposalUuid },
      })
        .then((response) => response.data ?? [])
        .catch(() => []),
    refetchOnWindowFocus: false,
    enabled,
  });

/**
 * The open reopenings of contributions the viewer may read, keyed by
 * contribution: what the call team asked its contributor to revise.
 */
export const useContributionReopenings = (proposalUuid: string) =>
  useQuery({
    queryKey: [...proposalContributionsKey(proposalUuid), 'reopenings'],
    queryFn: () =>
      proposalProposalsChangeRequestsList({ path: { uuid: proposalUuid } })
        .then((response) =>
          Object.fromEntries(
            (response.data ?? [])
              .filter((row) => row.contribution_uuid && row.is_open)
              .map((row) => [row.contribution_uuid, row]),
          ),
        )
        .catch(() => ({}) as Record<string, ProposalChangeRequest>),
    refetchOnWindowFocus: false,
  });
