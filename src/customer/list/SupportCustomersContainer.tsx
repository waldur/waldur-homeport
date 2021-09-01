import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { Panel } from '@waldur/core/Panel';
import { SupportCustomerFilter } from '@waldur/customer/list/SupportCustomerFilter';
import { SupportCustomerList } from '@waldur/customer/list/SupportCustomerList';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

export const SupportCustomersContainer: FunctionComponent = () => {
  useTitle(translate('Organizations'));
  const router = useRouter();
  if (!ENV.FEATURES.SUPPORT.CUSTOMERS_LIST) {
    router.stateService.go('errorPage.notFound');
  }
  return (
    <Panel>
      <SupportCustomerFilter />
      <SupportCustomerList />
    </Panel>
  );
};
