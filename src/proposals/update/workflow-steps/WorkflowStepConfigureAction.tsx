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
  refetch(): void;
}

export const WorkflowStepConfigureAction = ({
  row,
  call,
  refetch,
}: OwnProps) => {
  const { openDialog } = useModal();
  const open = useCallback(() => {
    openDialog(WorkflowStepConfigDialog, {
      resolve: { call, step: row, refetch },
      size: 'md',
    });
  }, [call, row, refetch, openDialog]);

  return (
    <ActionItem
      title={translate('Configure')}
      action={open}
      iconNode={<GearSixIcon weight="bold" />}
    />
  );
};
