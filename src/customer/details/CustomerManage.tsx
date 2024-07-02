import { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showError, showSuccess } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { updateCustomer } from './api';
import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';
import { CustomerEditPanels } from './CustomerEditPanels';
import { CustomerManagePageBar } from './CustomerManagePageBar';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

const CustomerErrorDialog = lazyComponent(
  () => import('./CustomerErrorDialog'),
  'CustomerErrorDialog',
);

interface OwnProps {
  tabSpec;
}

export const CustomerManage: FunctionComponent<OwnProps> = ({ tabSpec }) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const update = useCallback(
    async (formData, dispatch) => {
      if (canEditCustomer) {
        try {
          const response = await updateCustomer(customer.uuid, formData);
          dispatch(showSuccess(translate('Organization updated successfully')));
          if (response.data?.uuid === customer.uuid) {
            dispatch(setCurrentCustomer(response.data));
          }
          return response;
        } catch (error) {
          dispatch(showError(error.message));
          // Throw exception to the edit dialog
          if (!('image' in formData)) {
            throw error;
          }
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

  if (tabSpec) {
    return (
      <tabSpec.component
        customer={customer}
        callback={update}
        canUpdate={canEditCustomer}
      />
    );
  }

  return (
    <PageBarProvider>
      <CustomerManagePageBar />
      <div className="container-fluid py-10">
        <CustomerEditPanels
          customer={customer}
          callback={update}
          canUpdate={canEditCustomer}
        />
        <CustomerMarketplacePanel />
        {isFeatureVisible(
          MarketplaceFeatures.show_call_management_functionality,
        ) && <CustomerCallManagerPanel />}
        <CustomerRemovePanel />
      </div>
    </PageBarProvider>
  );
};
