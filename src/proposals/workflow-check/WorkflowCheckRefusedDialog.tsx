import { FC } from 'react';
import { WorkflowCheckFinding } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { summaryText } from './findings';
import { FindingsTable, useOpenValidationTab } from './WorkflowCheckPanel';

/**
 * The errors that stopped the call's activation, all of them, with the way
 * to the workflow check where each opens the setting that fixes it.
 */
export const WorkflowCheckRefusedDialog: FC<{
  resolve: { findings: WorkflowCheckFinding[] };
}> = ({ resolve: { findings } }) => {
  const { closeDialog } = useModal();
  const openValidationTab = useOpenValidationTab();
  return (
    <ModalDialog
      title={translate('The call cannot be activated')}
      subtitle={summaryText({ error: findings.length, warning: 0 })}
      footer={
        <>
          <CloseDialogButton className="min-w-[125px]" />
          <BaseButton
            variant="primary"
            size="lg"
            label={translate('Open the workflow check')}
            onClick={() => {
              closeDialog();
              openValidationTab('check');
            }}
          />
        </>
      }
    >
      <FindingsTable
        findings={findings}
        onAction={closeDialog}
        stepUnavailableReason={translate(
          'Open the workflow check to change the step.',
        )}
      />
    </ModalDialog>
  );
};
