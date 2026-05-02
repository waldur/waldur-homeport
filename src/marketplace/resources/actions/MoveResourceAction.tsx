import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { ResourceAction } from './constants';

const MoveResourceDialog = lazyComponent(() =>
  import('./MoveResourceDialog').then((module) => ({
    default: module.MoveResourceDialog,
  })),
);

export const MoveResourceAction: ActionItemType = ({ resource, refetch }) => {
  const { openDialog } = useModal();
  const isStaff = useSelector(isStaffSelector);

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
