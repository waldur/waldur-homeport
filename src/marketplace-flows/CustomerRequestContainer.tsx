import { useTitle } from 'react-use';

import { translate } from '@waldur/i18n';
import { useSupportItems } from '@waldur/navigation/navitems';

import { CustomerCreateRequestsList } from './CustomerCreateRequestsList';
import { FlowListFilter } from './FlowListFilter';

export const CustomerRequestContainer = () => {
  useTitle(translate('Organization creation requests'));
  useSupportItems();
  return <CustomerCreateRequestsList filters={<FlowListFilter />} />;
};
