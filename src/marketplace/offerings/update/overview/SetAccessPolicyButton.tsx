import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { isVisible } from '../../actions/utils';
import { RowEditButton } from '../RowEditButton';

const SetAccessPolicyDialog = lazyComponent(
  () => import('../../actions/SetAccessPolicyDialog'),
  'SetAccessPolicyDialog',
);

export const SetAccessPolicyButton = ({ offering, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetAccessPolicyDialog, {
        resolve: {
          offering,
          refetch,
        },
      }),
    );
  if (!isVisible(offering.state, user.is_staff)) {
    return null;
  }
  return <RowEditButton onClick={callback} size="sm" />;
};
