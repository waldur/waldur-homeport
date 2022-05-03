import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { SupportOfferingsFilter } from './SupportOfferingsFilter';
import { SupportOfferingsList } from './SupportOfferingsList';

export const SupportOfferingsContainer: FunctionComponent = () => {
  useTitle(translate('Offerings'));
  useReportingBreadcrumbs();
  return <SupportOfferingsList filters={<SupportOfferingsFilter />} />;
};
