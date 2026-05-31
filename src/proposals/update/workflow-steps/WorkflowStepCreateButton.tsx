import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { getStepDefinitions } from '@/proposals/workflow/constants';
import { ActionButton } from '@/table/ActionButton';

import { AddWorkflowStepDialog } from './AddWorkflowStepDialog';

interface OwnProps {
  call: Call;
  configuredSteps: CallWorkflowStep[];
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}

export const WorkflowStepCreateButton = ({
  call,
  configuredSteps,
  refetch,
  disabled: externalDisabled,
  tooltip: externalTooltip,
}: OwnProps) => {
  const { openDialog: openModal } = useModal();
  const allAdded = useMemo(
    () => configuredSteps.length >= getStepDefinitions().length,
    [configuredSteps.length],
  );

  const openDialog = useCallback(() => {
    openModal(AddWorkflowStepDialog, {
      resolve: { call, configuredSteps, refetch },
      size: 'md',
    });
  }, [call, configuredSteps, refetch, openModal]);

  const isDisabled = externalDisabled || allAdded;
  const reason = externalDisabled
    ? externalTooltip
    : allAdded
      ? translate('All workflow steps already configured.')
      : undefined;

  return (
    <ActionButton
      action={openDialog}
      title={translate('Add')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      disabled={isDisabled}
      tooltip={reason}
    />
  );
};
