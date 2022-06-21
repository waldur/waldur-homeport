import { connect } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails, User } from '@waldur/workspace/types';

import * as actions from './actions';

interface UserActivateButtonProps {
  user: User;
  row: UserDetails;
  onClick: () => void;
}

const PureUserActivateButton = (props: UserActivateButtonProps) =>
  props.user.is_staff ? (
    <Tip
      id="user-activate"
      label={
        props.row.is_active
          ? translate(
              'Inactive user will not be able to login into the portal.',
            )
          : translate('Active user will be able to login into the portal.')
      }
    >
      <ActionButton
        title={
          props.row.is_active ? translate('Deactivate') : translate('Activate')
        }
        action={props.onClick}
      />
    </Tip>
  ) : null;

const mapStatToProps = (state: RootState) => ({
  user: getUser(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (e) => {
    e.target.blur();
    if (ownProps.row.is_active) {
      return actions.deactivateUser(ownProps.row, dispatch);
    } else {
      return actions.activateUser(ownProps.row, dispatch);
    }
  },
});

const enhance = connect(mapStatToProps, mapDispatchToProps);

export const UserActivateButton = enhance(PureUserActivateButton);
