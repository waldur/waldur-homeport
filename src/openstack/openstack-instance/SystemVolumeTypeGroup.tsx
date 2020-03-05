import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const SystemVolumeTypeGroup = props =>
  props.volumeTypes.length > 0 ? (
    <CreateResourceFormGroup
      label={translate('System volume type')}
      required={true}
    >
      <Field
        name="attributes.system_volume_type"
        options={props.volumeTypes}
        component={SimpleSelectField}
        validate={required}
      />
    </CreateResourceFormGroup>
  ) : null;
