import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UserAgreementDeleteDialog = lazyComponent(
  () => import('./UserAgreementDeleteDialog'),
  'UserAgreementDeleteDialog',
);

const deleteUserAgreementDialog = (userAgreement) =>
  openModalDialog(UserAgreementDeleteDialog, { resolve: { userAgreement } });

export const UserAgreementDeleteButton: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () => dispatch(deleteUserAgreementDialog(props.userAgreement)),
    [],
  );
  return (
    <ActionButton
      title={translate('Delete')}
      action={callback}
      icon="fa fa-trash"
    />
  );
};
