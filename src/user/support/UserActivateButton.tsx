import { useState, MouseEvent } from 'react';
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
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const getConfirmationText = (isActive, name) => {
  return isActive
    ? translate(`Are you sure you want to deactivate ${name}? `)
    : translate(`Are you sure you want to activate ${name}? `);
};

const PureUserActivateButton = (props: UserActivateButtonProps) => {
  const [isActive, setIsActive] = useState(props.row.is_active);

  const toggleUserStatus = (event: MouseEvent<HTMLButtonElement>) => {
    if (confirm(getConfirmationText(isActive, props.row.full_name))) {
      setIsActive(!isActive);
      props.onClick(event);
    }
  };

  return props.user.is_staff ? (
    <Tip
      id="user-activate"
      label={
        isActive
          ? translate(
              'Inactive user will not be able to login into the portal.',
            )
          : translate('Active user will be able to login into the portal.')
      }
    >
      <ActionButton
        title={isActive ? translate('Deactivate') : translate('Activate')}
        action={toggleUserStatus}
        className="btn btn-danger btn-sm"
      />
    </Tip>
  ) : null;
};

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
