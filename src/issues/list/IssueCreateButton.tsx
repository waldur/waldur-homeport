import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export interface IssueCreateButtonProps {
  scope?: any;
  scopeType?: string;
  refetch?: () => void;
  issue?: any;
  options?: any;
  hideProjectAndResourceFields?: boolean;
}

export const IssueCreateButton: FunctionComponent<IssueCreateButtonProps> = (
  resolve,
) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      title={translate('Create')}
      action={() => {
        openDialog(IssueCreateDialog, {
          resolve,
          dialogClassName: 'modal-dialog-centered mw-650px',
          formId: ISSUE_CREATION_FORM_ID,
        });
      }}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
