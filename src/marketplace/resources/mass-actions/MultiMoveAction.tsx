import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
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
    <button className="btn btn-primary me-3" onClick={callback}>
      {translate('Move')}
    </button>
  ) : null;
};
