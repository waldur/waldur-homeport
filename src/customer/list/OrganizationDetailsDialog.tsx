import { FunctionComponent } from 'react';

import { OrganizationDetails } from '@waldur/customer/list/OrganizationDetails';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Customer } from '@waldur/workspace/types';

interface PureOrganizationDetailsDialogProps {
  resolve: {
    customer: Customer;
  };
}

export const OrganizationDetailsDialog: FunctionComponent<PureOrganizationDetailsDialogProps> =
  (props) => (
    <ModalDialog
      title={translate('Organization details')}
      footer={<CloseDialogButton />}
    >
      <OrganizationDetails customer={props.resolve.customer} />
    </ModalDialog>
  );
