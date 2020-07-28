import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { CustomerCreateDialog } from '@waldur/customer/create/CustomerCreateDialog';
import { canCreateOrganization } from '@waldur/customer/create/selectors';
import { withTranslation } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { OuterState } from '@waldur/workspace/types';

const CustomerCreateButton = ({ isVisible, onClick, translate }) =>
  isVisible ? (
    <ActionButton
      title={translate('Add organization')}
      action={onClick}
      icon="fa fa-plus"
    />
  ) : null;

const customerCreateDialog = () =>
  openModalDialog(CustomerCreateDialog, {
    size: 'lg',
    resolve: { role: 'CUSTOMER' },
  });

const enhance = compose(
  connect(
    (state: OuterState) => ({
      isVisible: canCreateOrganization(state),
    }),
    {
      onClick: customerCreateDialog,
    },
  ),
  withTranslation,
);

export default enhance(CustomerCreateButton);
