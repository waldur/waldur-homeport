import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const MoveResourceDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "MoveResourceDialog" */ '@waldur/marketplace/resources/list/MoveResourceDialog'
    ),
  'MoveResourceDialog',
);

interface MoveResourceActionProps {
  resource: Resource;
  refreshList?(): void;
}

export const MoveResourceAction = ({
  resource,
  refreshList,
}: MoveResourceActionProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(MoveResourceDialog, {
        resolve: {
          resource,
          refreshList,
        },
      }),
    );

  return isStaff ? (
    <ActionItem title={translate('Move')} action={callback} />
  ) : null;
};
