import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const SystemVolumeTypeGroup = props =>
  props.volumeTypes.length > 0 ? (
    <FormGroup
      label={translate('System volume type')}
      required={true}
      labelClassName={props.labelClassName}
      valueClassName={props.valueClassName}
    >
      <Field
        name="system_volume_type"
        options={props.volumeTypes}
        component={SimpleSelectField}
        validate={required}
      />
    </FormGroup>
  ) : null;
