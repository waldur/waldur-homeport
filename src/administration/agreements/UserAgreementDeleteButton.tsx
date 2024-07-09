import { Trash } from '@phosphor-icons/react';
import { useCallback, FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const UserAgreementDeleteDialog = lazyComponent(
  () => import('./UserAgreementDeleteDialog'),
  'UserAgreementDeleteDialog',
);

export const UserAgreementDeleteButton: FC<{ userAgreement }> = ({
  userAgreement,
}) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(UserAgreementDeleteDialog, {
          resolve: { userAgreement },
        }),
      ),
    [],
  );
  return (
    <RowActionButton
      title={translate('Delete')}
      action={callback}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
