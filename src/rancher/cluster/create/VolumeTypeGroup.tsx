import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const VolumeTypeGroup = props =>
  props.volumeTypes.length > 0 ? (
    <FormGroup label={translate('Volume type')} required={true}>
      <Field
        name="volume_type"
        options={props.volumeTypes}
        component={SimpleSelectField}
        validate={required}
      />
    </FormGroup>
  ) : null;
