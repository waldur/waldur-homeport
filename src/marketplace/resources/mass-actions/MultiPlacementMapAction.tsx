import { MapTrifoldIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

const PlacementMapBatchDialog = lazyComponent(() =>
  import('@/openstack/openstack-tenant/PlacementMapBatchDialog').then((m) => ({
    default: m.PlacementMapBatchDialog,
  })),
);

export const MultiPlacementMapAction = ({ rows }) => {
  const { openDialog } = useModal();
  const isStaff = useSelector(isStaffSelector);

  const instances = useMemo(
    () => rows.filter((resource) => resource.resource_type === INSTANCE_TYPE),
    [rows],
  );

  const callback = () =>
    openDialog(PlacementMapBatchDialog, {
      resolve: { rows: instances },
      size: 'xl',
    });

  if (!isStaff || instances.length === 0 || instances.length !== rows.length) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Placement map')}
      action={callback}
      iconNode={<MapTrifoldIcon weight="bold" />}
    />
  );
};
