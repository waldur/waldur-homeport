import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';

export const ProviderNameField: FunctionComponent<any> = (props) => (
  <StringField
    label={props.translate('Provider name')}
    name="name"
    required={true}
  />
);
