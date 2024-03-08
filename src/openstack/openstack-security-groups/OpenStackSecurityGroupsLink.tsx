import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const OpenStackSecurityGroupsDialog = lazyComponent(
  () => import('./OpenStackSecurityGroupsDialog'),
  'OpenStackSecurityGroupsDialog',
);

export const PureOpenStackSecurityGroupsLink = (props) =>
  props.items && props.items.length > 0 ? (
    <button className="text-btn text-dark" onClick={props.openDetailsDialog}>
      {props.items.map((item) => item.name).join(', ')}
      <i className="fa fa-info-circle ms-1" aria-hidden="true" />
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
