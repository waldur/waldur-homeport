import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerResourcesContainer: FunctionComponent = () => {
  useTitle(translate('My resources'));
  useSidebarKey('marketplace-services');
  return (
    <Card.Body>
      <CustomerResourcesFilter />
      <CustomerResourcesList />
    </Card.Body>
  );
};
