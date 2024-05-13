import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ROLE_FORM_ID } from './constants';

const AddRoleDialog = lazyComponent(
  () => import('./AddRoleDialog'),
  'AddRoleDialog',
);

export const AddRoleButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddRoleDialog, {
        resolve: { offering, refetch },
        formId: ROLE_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircle />}
      title={translate('Add role')}
      action={callback}
    />
  );
};
