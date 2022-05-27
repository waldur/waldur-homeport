import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useProviderItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

export const OfferingsListContainer: FunctionComponent = () => {
  useTitle(translate('Public offerings'));
  useProviderItems();
  return (
    <Panel>
      <OfferingsFilter />
      <OfferingsList />
    </Panel>
  );
};
