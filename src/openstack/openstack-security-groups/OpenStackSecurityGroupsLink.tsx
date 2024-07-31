import { Question } from '@phosphor-icons/react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const OpenStackSecurityGroupsDialog = lazyComponent(
  () => import('./OpenStackSecurityGroupsDialog'),
  'OpenStackSecurityGroupsDialog',
);

export const PureOpenStackSecurityGroupsLink = (props) =>
  props.items && props.items.length > 0 ? (
    <button
      className="btn btn-link btn-flush"
      onClick={props.openDetailsDialog}
    >
      {props.items.map((item) => item.name).join(', ')}
      <Question size={17} className="ms-1" />
    </button>
  ) : (
    <>&mdash;</>
  );

export const openDetailsDialog = (securityGroups) =>
  openModalDialog(OpenStackSecurityGroupsDialog, {
    resolve: { securityGroups },
    size: 'lg',
  });

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDetailsDialog: () => dispatch(openDetailsDialog(ownProps.items)),
});

export const OpenStackSecurityGroupsLink = connect(
  null,
  mapDispatchToProps,
)(PureOpenStackSecurityGroupsLink);
