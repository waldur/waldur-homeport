import * as React from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { OfferingsFilter } from '../OfferingsFilter';
import { OfferingsList } from '../OfferingsList';

export const SupportOfferings = () => {
  useTitle(translate('Offerings'));
  return (
    <Panel>
      <OfferingsFilter />
      <OfferingsList isReporting={true} />
    </Panel>
  );
};
