import * as React from 'react';
import { connect } from 'react-redux';

import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface OrganizationEditButtonProps {
  customer: Customer;
  openDialog(): void;
}

const PureOrganizationDetailsButton = (props: OrganizationEditButtonProps) => {
  return (
    <ActionButton
      title={translate('Edit')}
      icon="fa fa-pencil"
      action={props.openDialog}
    />
  );
};

const mapDispatchToProps = () => ({
  openDialog: () => null,
});

export const OrganizationEditButton = connect(
  null,
  mapDispatchToProps,
)(PureOrganizationDetailsButton);
