import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const ServiceNotAvailablePage: FunctionComponent = () => {
  useTitle(translate('Service not available'));
  return <ErrorPageView code="503" />;
};
