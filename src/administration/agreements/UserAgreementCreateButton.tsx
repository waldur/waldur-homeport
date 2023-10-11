import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UserAgreementCreateDialog = lazyComponent(
  () => import('./UserAgreementCreateDialog'),
  'UserAgreementCreateDialog',
);

export const UserAgreementCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UserAgreementCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'xl',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Create')}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
