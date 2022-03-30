import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getCustomer } from '@waldur/project/api';

import { CustomerSummary } from './CustomerSummary';
import { CustomerUsersList } from './CustomerUsersList';

export const CustomerPopover: FunctionComponent<{
  resolve: { customer_uuid };
}> = ({ resolve: { customer_uuid } }) => {
  const { loading, error, value } = useAsync(() => getCustomer(customer_uuid));
  return (
    <ModalDialog
      title={translate('Organization users list')}
      footer={<CloseDialogButton />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        translate('Unable to load data.')
      ) : (
        <Tabs
          unmountOnExit
          mountOnEnter
          defaultActiveKey="summary"
          id="customer-users"
        >
          <Tab title={translate('Company data')} eventKey="summary">
            <Card.Body>
              <CustomerSummary customer={value} />
            </Card.Body>
          </Tab>
          <Tab title={translate('Authorized personnel')} eventKey="users">
            <Card.Body>
              <CustomerUsersList customer={value} />
            </Card.Body>
          </Tab>
        </Tabs>
      )}
    </ModalDialog>
  );
};
