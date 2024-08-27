import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { isVisible } from '../../actions/utils';

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
  return <EditButton onClick={callback} size="sm" />;
};
