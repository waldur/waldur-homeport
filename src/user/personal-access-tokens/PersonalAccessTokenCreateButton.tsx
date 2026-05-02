import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const PersonalAccessTokenCreateDialog = lazyComponent(() =>
  import('./PersonalAccessTokenCreateDialog').then((module) => ({
    default: module.PersonalAccessTokenCreateDialog,
  })),
);

export const PersonalAccessTokenCreateButton: FunctionComponent<{
  refetch?;
}> = ({ refetch }) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(PersonalAccessTokenCreateDialog, {
        size: 'lg',
        resolve: { refetch },
      }),
    [openDialog, refetch],
  );

  return (
    <ActionButton
      title={translate('Create token')}
      action={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
