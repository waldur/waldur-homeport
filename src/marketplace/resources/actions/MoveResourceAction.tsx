import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const MoveResourceDialog = lazyComponent(
  () => import('./MoveResourceDialog'),
  'MoveResourceDialog',
);

export const MoveResourceAction: ActionItemType = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(MoveResourceDialog, {
        resolve: {
          resource,
          refetch,
        },
      }),
    );

  return isStaff ? (
    <ActionItem title={translate('Move')} action={callback} staff />
  ) : null;
};
