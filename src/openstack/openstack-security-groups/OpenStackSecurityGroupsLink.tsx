import * as React from 'react';
import { connect } from 'react-redux';

import { openModalDialog } from '@waldur/modal/actions';

export const PureOpenStackSecurityGroupsLink = props =>
  props.items && props.items.length > 0 ? (
    <span className="cursor-pointer" onClick={props.openDetailsDialog}>
      {props.items.map(item => item.name).join(', ')}
      <i className="fa fa-info-circle m-l-xs" aria-hidden="true" />
    </span>
  ) : (
    <span>&mdash;</span>
  );

export const openDetailsDialog = securityGroups =>
  openModalDialog('securityGroupsDialog', { resolve: { securityGroups } });

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDetailsDialog: () => dispatch(openDetailsDialog(ownProps.items)),
});

export const OpenStackSecurityGroupsLink = connect(
  null,
  mapDispatchToProps,
)(PureOpenStackSecurityGroupsLink);
