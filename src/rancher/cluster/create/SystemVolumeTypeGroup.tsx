import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const SystemVolumeTypeGroup: FunctionComponent<any> = (props) =>
  props.volumeTypes.length > 0 ? (
    <FormGroup label={translate('System volume type')} required={true}>
      <Field
        name="system_volume_type"
        options={props.volumeTypes}
        component={SimpleSelectField}
        validate={required}
      />
    </FormGroup>
  ) : null;
