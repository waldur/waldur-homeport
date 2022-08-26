import { useTitle } from 'react-use';

import { translate } from '@waldur/i18n';

import { CustomerCreateRequestsList } from './CustomerCreateRequestsList';
import { FlowListFilter } from './FlowListFilter';

export const CustomerRequestContainer = () => {
  useTitle(translate('Organization creation requests'));
  return <CustomerCreateRequestsList filters={<FlowListFilter />} />;
};
