import { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { customersPartialUpdate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PageBarProvider } from '@/marketplace/context';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer, getUser } from '@/workspace/selectors';

import { CustomerCallManagerPanel } from './CustomerCallManagerPanel';
import { CustomerEditPanels } from './CustomerEditPanels';
import { CustomerManagePageBar } from './CustomerManagePageBar';
import { CustomerMarketplacePanel } from './CustomerMarketplacePanel';
import { CustomerRemovePanel } from './CustomerRemovePanel';

const CustomerErrorDialog = lazyComponent(() =>
  import('./CustomerErrorDialog').then((module) => ({
    default: module.CustomerErrorDialog,
  })),
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
          const response = await customersPartialUpdate({
            path: { uuid: customer.uuid },
            body: {
              ...formData,
              image: fileSerializer(formData.image),
              country:
                'country' in formData && formData.country
                  ? formData.country.value
                  : undefined,
            },
            ...formDataOptions,
          });
          dispatch(showSuccess(translate('Organization updated successfully')));
          if (response.data?.uuid === customer.uuid) {
            dispatch(setCurrentCustomer(response.data));
          }
          return response;
        } catch (error) {
          dispatch(showErrorResponse(error));
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
