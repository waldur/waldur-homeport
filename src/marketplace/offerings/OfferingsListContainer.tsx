import { FunctionComponent } from 'react';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { useProviderItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';

import { OfferingsFilter } from './OfferingsFilter';
import { OfferingsList } from './OfferingsList';

export const OfferingsListContainer: FunctionComponent = () => {
  useTitle(translate('Public offerings'));
  useProviderItems();
  useBreadcrumbs([{ label: translate('Provider') }]);
  return (
    <Panel>
      <OfferingsList filters={<OfferingsFilter />} />
    </Panel>
  );
};
