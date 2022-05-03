import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

export const SupportResourcesContainer: FunctionComponent = () => {
  useTitle(translate('Resources'));
  return <SupportResourcesList filters={<SupportResourcesFilter />} />;
};
