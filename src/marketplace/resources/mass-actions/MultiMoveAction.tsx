import { ArrowsOutCardinal } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const MultiMoveDialog = lazyComponent(
  () => import('./MultiMoveDialog'),
  'MultiMoveDialog',
);

export const MultiMoveAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(MultiMoveDialog, {
        resolve: {
          rows,
          refetch,
        },
      }),
    );

  return isStaff ? (
    <ActionItem
      title={translate('Move')}
      action={callback}
      iconNode={<ArrowsOutCardinal />}
    />
  ) : null;
};
