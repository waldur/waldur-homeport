import { HandshakeIcon } from '@phosphor-icons/react';
import {
  CallWorkflowStep,
  proposalProtectedCallsWorkflowStepsSet,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { callWorkflowStepsKey } from '@/proposals/workflow/queries';
import {
  callWorkflowCheckKey,
  callWorkflowDescriptionKey,
} from '@/proposals/workflow-description/queries';

const AWARD_RESPONSE_KEY = 'award_response';

/** Whether the call has an allocation decision and no award response yet. */
export const canAddAwardResponse = (steps: CallWorkflowStep[] = []) =>
  steps.some((step) => step.is_allocation_decision) &&
  !steps.some((step) => step.key === AWARD_RESPONSE_KEY);

interface OwnProps {
  call: Call;
  // Every step of the call, in workflow order.
  steps?: CallWorkflowStep[];
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}

// The award response asks the applicant to accept or decline the award, and a
// decline cancels the proposal. The backend fills it in from its key and puts
// it right after the allocation decision.
export const AddAwardResponseButton = ({
  call,
  steps,
  refetch,
  disabled,
  tooltip,
}: OwnProps) => {
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      proposalProtectedCallsWorkflowStepsSet({
        path: { uuid: call.uuid },
        body: { key: AWARD_RESPONSE_KEY, is_enabled: true },
      }),
    successMessage: translate('Award response added.'),
    errorMessage: translate('Unable to add the award response.'),
    refetch,
    // No dialog is open to close.
    closeModal: false,
    // The workflow check and description read the steps too.
    invalidateQueries: [
      { queryKey: callWorkflowStepsKey(call.uuid) },
      { queryKey: callWorkflowDescriptionKey(call.uuid) },
      { queryKey: callWorkflowCheckKey(call.uuid) },
    ],
  });

  if (!canAddAwardResponse(steps)) {
    return null;
  }

  return (
    <BaseButton
      onClick={() => mutate(undefined)}
      label={translate('Add award response')}
      iconNode={<HandshakeIcon weight="bold" />}
      variant="tertiary"
      disabled={disabled || isPending}
      tooltip={
        disabled
          ? tooltip
          : translate(
              'Ask the applicant to accept or decline the award after the allocation decision. A decline cancels the proposal.',
            )
      }
      size="lg"
    />
  );
};
