import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ErrorPageView } from './ErrorPageView';

export const ServiceNotAvailablePage: FunctionComponent = () => {
  useTitle(translate('Service not available'));
  return <ErrorPageView code="503" />;
};
