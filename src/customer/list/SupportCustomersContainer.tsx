import { FunctionComponent } from 'react';

import { SupportCustomerFilter } from '@waldur/customer/list/SupportCustomerFilter';
import { SupportCustomerList } from '@waldur/customer/list/SupportCustomerList';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

export const SupportCustomersContainer: FunctionComponent = () => {
  useTitle(translate('Organizations'));
  return <SupportCustomerList filters={<SupportCustomerFilter />} />;
};
