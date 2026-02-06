import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

const UserActionsDialog = lazyComponent(() =>
  import('./UserActionsDialog').then((module) => ({
    default: module.UserActionsDialog,
  })),
);

export const RecalculateUserActionsButton: FunctionComponent<{ row }> = ({
  row,
}) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  if (!user?.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('User actions')}
      action={() =>
        dispatch(
          openModalDialog(UserActionsDialog, {
            resolve: { user: row },
            size: 'lg',
          }),
        )
      }
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
      size="sm"
    />
  );
};
