import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

const MultiMoveDialog = lazyComponent(() =>
  import('./MultiMoveDialog').then((module) => ({
    default: module.MultiMoveDialog,
  })),
);

export const MultiMoveAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.MOVE_RESOURCE,
          ),
      ),
    [rows],
  );

  const callback = () =>
    dispatch(
      openModalDialog(MultiMoveDialog, {
        resolve: {
          rows: permittedResources,
          refetch,
        },
      }),
    );

  if (!isStaff || permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Move')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      disabled={permittedResources.length !== rows.length}
    />
  );
};
