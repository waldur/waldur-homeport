import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const MoveResourceDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "MoveResourceDialog" */ './MoveResourceDialog'),
  'MoveResourceDialog',
);

interface MoveResourceActionProps {
  resource: Resource;
  reInitResource?(): void;
  refreshList?(): void;
}

export const MoveResourceAction: FC<MoveResourceActionProps> = ({
  resource,
  reInitResource,
  refreshList,
}) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(MoveResourceDialog, {
        resolve: {
          resource,
          reInitResource,
          refreshList,
        },
      }),
    );

  return isStaff ? (
    <ActionItem title={translate('Move')} action={callback} />
  ) : null;
};
