import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/project/api';

import { CustomerEditPanels } from '../details/CustomerEditPanels';
import { CustomerManagePageBar } from '../details/CustomerManagePageBar';

import { updateOrganization } from './store/actions';

export const OrganizationUpdateContainer: FunctionComponent = () => {
  useFullPage();

  const {
    params: { customer_uuid },
  } = useCurrentStateAndParams();
  const {
    loading,
    error,
    value: customer,
  } = useAsync(() => getCustomer(customer_uuid));

  useTitle(
    customer
      ? translate('Organization update ({name})', {
          name: customer.name,
        })
      : translate('Organization update'),
  );

  const updateCustomer = useCallback(
    (formData, dispatch) => {
      return dispatch(
        updateOrganization({
          ...formData,
          uuid: customer.uuid,
          country: formData.country?.value,
        }),
      );
    },
    [customer],
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load customer.')}</>
  ) : (
    <PageBarProvider>
      <CustomerManagePageBar />
      <div className="container-xxl py-10">
        <CustomerEditPanels
          customer={customer}
          canUpdate={true}
          callback={updateCustomer}
        />
      </div>
    </PageBarProvider>
  );
};
