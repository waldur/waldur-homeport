import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';

interface UserDetailsButtonProps {
  row: UserDetails;
  onClick: () => void;
}

const PureUserDetailsButton: FunctionComponent<UserDetailsButtonProps> = (
  props,
) => <ActionButton title={translate('Details')} action={props.onClick} />;

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (e) => {
    e.target.blur();
    return dispatch(actions.showUserDetails(ownProps.row));
  },
});

const enhance = connect(null, mapDispatchToProps);

export const UserDetailsButton = enhance(PureUserDetailsButton);
