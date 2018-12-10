import * as React from 'react';
import { connect } from 'react-redux';

import { isCustomerQuotaReached } from '@waldur/core/ncUtils';
import { translate } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { gotoProjectCreate } from './actions';

const PureProjectCreateButton = props => (
  <ActionButton
    title={translate('Add project')}
    action={props.gotoProjectCreate}
    tooltip={props.tooltip}
    icon="fa fa-plus"
    disabled={props.disabled}
  />
);

const mapStateToProps = state => {
  const ownerOrStaff = isOwnerOrStaff(state);
  const customer = getCustomer(state);

  if (!ownerOrStaff) {
    return {
      disabled: true,
      tooltip: translate('You don\'t have enough privileges to perform this operation.'),
    };
  } else if (isCustomerQuotaReached(customer, 'project')) {
    return {
      disabled: true,
      tooltip: translate('Quota has been reached.'),
    };
  } else {
    return {
      disabled: false,
    };
  }
};

const enhance = connect(mapStateToProps, { gotoProjectCreate });

export const ProjectCreateButton = enhance(PureProjectCreateButton) as React.ComponentType<{}>;
