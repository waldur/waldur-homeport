import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const ProviderNameField: FunctionComponent<{}> = () => (
  <StringField label={translate('Provider name')} name="name" required={true} />
);
