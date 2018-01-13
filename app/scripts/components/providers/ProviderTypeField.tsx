import * as React from 'react';

import { SelectField } from '@waldur/form-react';
import { optionRenderer } from '@waldur/form-react/optionRenderer';
import { getServiceIcon } from '@waldur/providers/registry';

const providerRenderer = optionRenderer({
  labelKey: 'name',
  iconKey: provider => getServiceIcon(provider.type),
  imgStyle: {width: 19},
});

export const ProviderTypeField = props => (
  <SelectField
    label={props.translate('Provider type')}
    name="type"
    placeholder={props.translate('Select provider type')}
    options={props.types}
    labelKey="name"
    valueKey="type"
    clearable={false}
    optionRenderer={providerRenderer}
    valueRenderer={providerRenderer}
  />
);
