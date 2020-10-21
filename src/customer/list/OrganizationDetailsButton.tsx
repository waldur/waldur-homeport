import * as React from 'react';
import { connect } from 'react-redux';

import { OrganizationDetailsDialog } from '@waldur/customer/list/OrganizationDetailsDialog';
import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

interface OrganizationDetailsButtonProps {
  customer: Customer;
  openDialog(): void;
}

const openOrganizationDetailsDialog = (props: OrganizationDetailsButtonProps) =>
  openModalDialog(OrganizationDetailsDialog, {
    resolve: props,
    size: 'lg',
  });

const PureOrganizationDetailsButton = (
  props: OrganizationDetailsButtonProps,
) => (
  <ActionButton
    title={translate('Details')}
    icon="fa fa-eye"
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openOrganizationDetailsDialog(ownProps)),
});

export const OrganizationDetailsButton = connect(
  null,
  mapDispatchToProps,
)(PureOrganizationDetailsButton);
