import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { responsibleRoleLabel } from '../workflow/constants';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '../workflow/queries';

/** The call step a proposal stands in, as the call's own steps name it. */
const useProposalStep = (callUuid: string, step: string | null | undefined) => {
  const { data: steps } = useQuery({
    queryKey: callWorkflowStepsKey(callUuid),
    queryFn: () => fetchCallWorkflowSteps(callUuid),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(callUuid && step),
  });
  return useMemo(
    () => (step ? (steps || []).find((item) => item.key === step) : undefined),
    [steps, step],
  );
};

/**
 * Which step a proposal is sitting on, on one line as a table cell has it;
 * who owes the next move is in the row's details (ProposalStepOwner).
 *
 * The proposal knows its step by key; the call's own steps give its name.
 * Until they load, or for a viewer who may not read them, the key stands in
 * for the name.
 */
export const ProposalStepCell: FC<{
  callUuid: string;
  /** Key of the call step the proposal stands in. */
  step: string | null | undefined;
}> = ({ callUuid, step }) => {
  const configured = useProposalStep(callUuid, step);
  // No step means no workflow is running on this proposal — a draft, or a call
  // that enables no steps at all. Saying "—" is honest; naming a step is not.
  if (!step) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return <>{configured?.name || step}</>;
};

/**
 * Who owes the next move on the proposal's step: its responsible role, or
 * nobody while the decision is held for the round. Null when neither is known.
 */
export const useProposalStepOwner = (
  callUuid: string,
  step: string | null | undefined,
  decisionHeld?: boolean | null,
): string | null => {
  const configured = useProposalStep(callUuid, step);
  if (!step) return null;
  if (decisionHeld) return translate('Held until the round publishes results');
  return configured?.completer
    ? responsibleRoleLabel(configured.completer)
    : null;
};
