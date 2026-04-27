import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CreateProviderOfferingUserDialog = lazyComponent(() =>
  import('./CreateProviderOfferingUserDialog').then((module) => ({
    default: module.CreateProviderOfferingUserDialog,
  })),
);

export const CreateProviderOfferingUserButton = ({ refetch, provider }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      action={() =>
        dispatch(
          openModalDialog(CreateProviderOfferingUserDialog, {
            resolve: { refetch, provider },
          }),
        )
      }
    />
  );
};
