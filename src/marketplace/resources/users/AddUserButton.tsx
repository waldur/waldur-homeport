import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
