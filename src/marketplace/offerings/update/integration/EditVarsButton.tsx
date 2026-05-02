import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ENVIRON_FORM_ID } from './constants';
import { EditVarsDialogOwnProps } from './EditVarsDialog';

const EditVarsDialog = lazyComponent(() =>
  import('./EditVarsDialog').then((module) => ({
    default: module.EditVarsDialog,
  })),
);

export const EditVarsButton: FunctionComponent<
  EditVarsDialogOwnProps['resolve']
> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditVarsDialog, {
      resolve: { offering, refetch },
      size: 'lg',
      formId: ENVIRON_FORM_ID,
    });
  };
  return (
    <ActionButton
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
      title={translate('Edit environment variables')}
      className="me-3"
    />
  );
};
