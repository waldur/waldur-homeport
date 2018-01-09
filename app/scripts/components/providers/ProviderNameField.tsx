import * as React from 'react';

import { StringField} from '@waldur/form-react';

export const ProviderNameField = props => (
  <StringField
    label={props.translate('Provider name')}
    name="name"
    required={true}
  />
);
