import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails, User } from '@waldur/workspace/types';

import * as actions from './actions';

interface UserActivateButtonProps extends TranslateProps {
  user: User;
  row: UserDetails;
  onClick: () => void;
}

const PureUserActivateButton = (props: UserActivateButtonProps) => props.user.is_staff ? (
  <ActionButton
    title={props.row.is_active ? props.translate('Deactivate') : props.translate('Activate')}
    action={props.onClick}
  />
) : null;

const mapStatToProps = state => ({
  user: getUser(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: e => {
    e.target.blur();
    if (ownProps.row.is_active) {
      return actions.deactivateUser(ownProps.row, dispatch);
    } else {
      return actions.activateUser(ownProps.row, dispatch);
    }
  },
});

const enhance = compose(
  connect(mapStatToProps, mapDispatchToProps),
  withTranslation,
);

export const UserActivateButton = enhance(PureUserActivateButton);
