import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { CallWorkflowStep } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import {
  getStepDefinitions,
  stepDefinition,
} from '@/proposals/workflow/constants';
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
  // Toggle-managed steps (award_response) are provisioned by another step's
  // flag and never offered in the dialog, so they must not count on either
  // side of this comparison: counting them in the catalogue alone leaves the
  // button enabled on a fully configured call, and the dialog then opens with
  // an empty step picker.
  const allAdded = useMemo(() => {
    const addable = (step: { step: CallWorkflowStep['step'] }) =>
      !stepDefinition(step.step)?.managedByToggle;
    return (
      configuredSteps.filter(addable).length >=
      getStepDefinitions().filter((d) => !d.managedByToggle).length
    );
  }, [configuredSteps]);

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
