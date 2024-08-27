import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

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
  return <EditButton onClick={callback} size="sm" />;
};
