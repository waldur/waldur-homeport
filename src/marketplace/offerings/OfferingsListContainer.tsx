import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

export const OfferingsListContainer: FunctionComponent = () => {
  return (
    <Panel>
      <OfferingsList filters={<OfferingsFilter />} />
    </Panel>
  );
};
