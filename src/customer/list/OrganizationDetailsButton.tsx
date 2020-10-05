import * as React from 'react';
import { connect } from 'react-redux';

import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface OrganizationDetailsButtonProps {
  customer: Customer;
  openDialog(): void;
}

const PureOrganizationDetailsButton = (
  props: OrganizationDetailsButtonProps,
) => {
  return (
    <ActionButton
      title={translate('Details')}
      icon="fa fa-eye"
      action={props.openDialog}
    />
  );
};

const mapDispatchToProps = () => ({
  openDialog: () => null,
});

export const OrganizationDetailsButton = connect(
  null,
  mapDispatchToProps,
)(PureOrganizationDetailsButton);
