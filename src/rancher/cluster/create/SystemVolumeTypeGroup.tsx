import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

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
