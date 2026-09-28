import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ROLE_FORM_ID } from './constants';

const AddRoleDialog = lazyComponent(() =>
  import('./AddRoleDialog').then((module) => ({
    default: module.AddRoleDialog,
  })),
);

export const AddRoleButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddRoleDialog, {
      resolve: { offering, refetch },
      formId: ROLE_FORM_ID,
    });
  };
  return (
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add role')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};
