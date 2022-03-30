import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { MyOfferingsList } from './MyOfferingsList';
import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';

export const MyOfferingsListContainer: FunctionComponent = () => {
  useTitle(translate('My offerings'));
  useSidebarKey('marketplace-services');
  return (
    <Card.Body>
      <MyOfferingsFilter />
      <MyOfferingsList />
    </Card.Body>
  );
};
