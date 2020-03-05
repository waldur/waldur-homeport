import * as React from 'react';
import { Field } from 'redux-form';

import { formatFilesize } from '@waldur/core/utils';
import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const FlavorGroup = props => (
  <CreateResourceFormGroup label={translate('Flavor')} required={true}>
    <Field
      name="attributes.flavor"
      component={fieldProps => (
        <SelectDialogField
          id="flavor"
          columns={[
            {
              label: translate('Flavor name'),
              name: 'name',
            },
            {
              label: 'vCPU',
              name: 'cores',
            },
            {
              label: 'RAM',
              name: 'ram',
              filter: formatFilesize,
            },
            {
              label: translate('Storage'),
              name: 'disk',
              filter: formatFilesize,
            },
          ]}
          choices={props.flavors}
          input={fieldProps.input}
        />
      )}
    />
  </CreateResourceFormGroup>
);
