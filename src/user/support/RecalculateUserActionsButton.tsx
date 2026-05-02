import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const UserActionsDialog = lazyComponent(() =>
  import('./UserActionsDialog').then((module) => ({
    default: module.UserActionsDialog,
  })),
);

export const RecalculateUserActionsButton: FunctionComponent<{ row }> = ({
  row,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  if (!user?.is_staff || !isFeatureVisible(UserFeatures.pending_user_actions)) {
    return null;
  }

  return (
    <ActionItem
      title={translate('User actions')}
      action={() =>
        openDialog(UserActionsDialog, {
          resolve: { user: row },
          size: 'lg',
        })
      }
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
      size="sm"
    />
  );
};
