import { connect, useDispatch } from 'react-redux';

import { rejectBooking } from '@waldur/booking/api';
import * as constants from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import {
  getUser,
  isOwner,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  isOwner: isOwner(state),
  isServiceManager: isServiceManagerSelector(state),
});

type StateProps = ReturnType<typeof mapStateToProps>;

const PureCancelAction = (props) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Cancel resource'),
        translate('Are you sure you want to cancel a {name}?', {
          name: props.resource.name.toUpperCase(),
        }),
      );
    } catch {
      return;
    }
    try {
      await rejectBooking(props.resource.uuid);
      dispatch(showSuccess(translate('Resource has been cancelled.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to cancel resource.')));
    }
  };
  return (
    <ActionItem
      title={translate('Cancel')}
      action={callback}
      disabled={
        props.resource.state !== constants.BOOKING_CREATED &&
        !props.user.is_staff &&
        !props.isOwner &&
        !props.isServiceManager
      }
    />
  );
};

export const CancelAction = connect<StateProps>(mapStateToProps)(
  PureCancelAction,
);
