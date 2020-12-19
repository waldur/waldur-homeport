import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerResourcesContainer: FunctionComponent = () => {
  useTitle(translate('My resources'));
  return (
    <div className="ibox-content">
      <CustomerResourcesFilter />
      <CustomerResourcesList />
    </div>
  );
};
