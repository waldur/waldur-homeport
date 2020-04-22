import * as React from 'react';

import { Panel } from '@waldur/core/Panel';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

export const OfferingsListContainer = () => (
  <Panel>
    <OfferingsFilter />
    <OfferingsList />
  </Panel>
);
