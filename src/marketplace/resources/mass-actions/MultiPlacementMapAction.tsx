import { MapTrifoldIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const PlacementMapBatchDialog = lazyComponent(() =>
  import('@waldur/openstack/openstack-tenant/PlacementMapBatchDialog').then(
    (m) => ({ default: m.PlacementMapBatchDialog }),
  ),
);

export const MultiPlacementMapAction = ({ rows }) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const instances = useMemo(
    () => rows.filter((resource) => resource.resource_type === INSTANCE_TYPE),
    [rows],
  );

  const callback = () =>
    dispatch(
      openModalDialog(PlacementMapBatchDialog, {
        resolve: { rows: instances },
        size: 'xl',
      }),
    );

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
