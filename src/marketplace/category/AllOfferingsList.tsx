import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  useTitle(translate('All offerings'));
  return <PublicOfferingsList />;
};
