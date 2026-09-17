import { GearSixIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';

import { WorkflowStepConfigDialog } from './WorkflowStepConfigDialog';

interface OwnProps {
  row: CallWorkflowStep;
  call: Call;
  // All configured steps: the dialog's enable switch needs them to resolve
  // this step's dependencies and dependents.
  steps: CallWorkflowStep[];
  refetch(): void;
}

export const WorkflowStepConfigureAction = ({
  row,
  call,
  steps,
  refetch,
}: OwnProps) => {
  const { openDialog } = useModal();
  const open = useCallback(() => {
    openDialog(WorkflowStepConfigDialog, {
      resolve: { call, step: row, steps, refetch },
      size: 'md',
    });
  }, [call, row, steps, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Configure')}
      action={open}
      iconNode={<GearSixIcon weight="bold" />}
    />
  );
};
