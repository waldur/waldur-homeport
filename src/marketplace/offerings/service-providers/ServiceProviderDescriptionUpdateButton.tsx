import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const ServiceProviderDescriptionUpdateButton: FunctionComponent = () => {
  return <button>{translate('Update')}</button>;
};
