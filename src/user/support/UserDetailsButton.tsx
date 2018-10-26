import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';

interface UserDetailsButtonProps extends TranslateProps {
  row: UserDetails;
  onClick: () => void;
}

const PureUserDetailsButton = (props: UserDetailsButtonProps) => (
  <ActionButton
    title={props.translate('Details')}
    action={props.onClick}
    icon="fa fa-icon-info-sign"/>
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: e => {
    e.target.blur();
    return dispatch(actions.showUserDetails(ownProps.row));
  },
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  withTranslation,
);

export const UserDetailsButton = enhance(PureUserDetailsButton);
