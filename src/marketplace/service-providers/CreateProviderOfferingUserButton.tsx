import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CreateProviderOfferingUserDialog = lazyComponent(() =>
  import('./CreateProviderOfferingUserDialog').then((module) => ({
    default: module.CreateProviderOfferingUserDialog,
  })),
);

export const CreateProviderOfferingUserButton = ({ refetch, provider }) => {
  const dispatch = useDispatch();
  return (
    <AddButton
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
