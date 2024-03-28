import { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { openModalDialog } from '@waldur/modal/actions';
import { useFullPage } from '@waldur/navigation/context';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showError, showSuccess } from '@waldur/store/notify';
import { getUser, getCustomer } from '@waldur/workspace/selectors';

import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';
import { CustomerEditPanels } from './CustomerEditPanels';
import { CustomerManagePageBar } from './CustomerManagePageBar';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

const CustomerErrorDialog = lazyComponent(
  () => import('./CustomerErrorDialog'),
  'CustomerErrorDialog',
);

export const CustomerManage: FunctionComponent = () => {
  useFullPage();

  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const updateCustomer = useCallback(
    async (formData, dispatch) => {
      if (canEditCustomer) {
        const data = { ...formData };
        if ('image' in data) {
          if (!data.image) {
            data.image = '';
          } else if (!(data.image instanceof File)) {
            data.image = undefined;
          }
        }
        if ('country' in data) {
          data.country = data.country.value;
        }

        try {
          const response = await sendForm(
            'PATCH',
            `${ENV.apiEndpoint}api/customers/${customer.uuid}/`,
            data,
          );
          dispatch(showSuccess(translate('Organization updated successfully')));
          return response;
        } catch (error) {
          dispatch(showError(error.message));
        }
      } else {
        dispatch(
          openModalDialog(CustomerErrorDialog, {
            resolve: { customer, formData },
          }),
        );
      }
    },
    [canEditCustomer, customer],
  );

  return (
    <PageBarProvider>
      <CustomerManagePageBar />
      <div className="container-xxl py-10">
        <CustomerEditPanels
          customer={customer}
          callback={updateCustomer}
          canUpdate={canEditCustomer}
        />
        <CustomerMarketplacePanel />
        {isFeatureVisible('marketplace.show_call_management_functionality') && (
          <CustomerCallManagerPanel />
        )}
        <CustomerRemovePanel />
      </div>
    </PageBarProvider>
  );
};
