import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { getUser } from '@/workspace/selectors';

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

  if (!user?.is_staff || !isFeatureVisible(UserFeatures.pending_user_actions)) {
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
