import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const UserAgreementsEditDialog = lazyComponent(
  () => import('./UserAgreementsEditDialog'),
  'UserAgreementsEditDialog',
);

export const UserAgreementsEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UserAgreementsEditDialog, {
        resolve: {
          initialValues: {
            url: row.url,
            agreement_type: row.agreement_type,
            content: row.content,
          },
          refetch,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};
