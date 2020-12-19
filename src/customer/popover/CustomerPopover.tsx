import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/marketplace/common/api';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { CustomerSummary } from './CustomerSummary';
import { CustomerUsersList } from './CustomerUsersList';

export const CustomerPopover: FunctionComponent<{
  resolve: { customer_uuid };
}> = ({ resolve: { customer_uuid } }) => {
  const { loading, error, value } = useAsync(
    async () => await getCustomer(customer_uuid),
    [],
  );
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
          animation={false}
        >
          <Tab title={translate('Company data')} eventKey="summary">
            <PanelBody>
              <CustomerSummary customer={value} />
            </PanelBody>
          </Tab>
          <Tab title={translate('Authorized personnel')} eventKey="users">
            <PanelBody>
              <CustomerUsersList customer={value} />
            </PanelBody>
          </Tab>
        </Tabs>
      )}
    </ModalDialog>
  );
};
