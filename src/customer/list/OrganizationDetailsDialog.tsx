import { FunctionComponent } from 'react';

import { OrganizationDetails } from '@waldur/customer/list/OrganizationDetails';
import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface PureOrganizationDetailsDialogProps {
  resolve: {
    customer: Customer;
  };
}

export const OrganizationDetailsDialog: FunctionComponent<PureOrganizationDetailsDialogProps> = (
  props,
) => (
  <ModalDialog
    title={translate('Organization details')}
    footer={<CloseDialogButton />}
  >
    <OrganizationDetails customer={props.resolve.customer} />
  </ModalDialog>
);
