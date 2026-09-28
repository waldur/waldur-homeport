import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ENVIRON_FORM_ID } from './constants';
import { EditVarsDialogProps } from './EditVarsDialog';

const EditVarsDialog = lazyComponent(() =>
  import('./EditVarsDialog').then((module) => ({
    default: module.EditVarsDialog,
  })),
);

export const EditVarsButton: FunctionComponent<
  EditVarsDialogProps['resolve']
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
    <BaseButton
      onClick={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
      label={translate('Edit environment variables')}
      className="me-3"
      variant="tertiary"
      size="lg"
    />
  );
};
