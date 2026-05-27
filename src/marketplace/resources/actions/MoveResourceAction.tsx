import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from './constants';

const MoveResourceDialog = lazyComponent(() =>
  import('./MoveResourceDialog').then((module) => ({
    default: module.MoveResourceDialog,
  })),
);

export const MoveResourceAction: ActionItemType = ({ resource, refetch }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const isStaff = user?.is_staff;

  const callback = () =>
    openDialog(MoveResourceDialog, {
      resolve: {
        resource,
        refetch,
      },
    });

  return isStaff ? (
    <ActionItem
      title={translate('Move')}
      action={callback}
      staff
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      actionId={ResourceAction.MOVE_RESOURCE}
      resource={resource}
    />
  ) : null;
};
