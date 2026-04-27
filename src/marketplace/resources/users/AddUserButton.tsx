import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: FunctionComponent<{
  resource;
  offering;
  refetch;
}> = ({ resource, offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddUserDialog, {
        resolve: { resource, offering, refetch },
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Assign user')}
      action={callback}
    />
  );
};
