import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';

import { AddWorkflowStepDialog } from './AddWorkflowStepDialog';

interface OwnProps {
  call: Call;
  // Every step of the call, in workflow order.
  steps?: CallWorkflowStep[];
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}

// A step of any kind can always be added -- a kind may appear any number of
// times -- so the button is only ever disabled for a call that cannot change.
export const WorkflowStepCreateButton = ({
  call,
  steps,
  refetch,
  disabled,
  tooltip,
}: OwnProps) => {
  const { openDialog: openModal } = useModal();

  const openDialog = useCallback(() => {
    openModal(AddWorkflowStepDialog, {
      resolve: { call, steps, refetch },
      size: 'lg',
    });
  }, [call, steps, refetch, openModal]);

  return (
    <BaseButton
      onClick={openDialog}
      label={translate('Add')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      disabled={disabled}
      tooltip={disabled ? tooltip : undefined}
      size="lg"
    />
  );
};
