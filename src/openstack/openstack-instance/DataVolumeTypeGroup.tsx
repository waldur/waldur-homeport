import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const DataVolumeTypeGroup: FunctionComponent<any> = (props) =>
  props.volumeTypes.length > 0 ? (
    <CreateResourceFormGroup>
      <label>{translate('Data volume type')}</label>
      <Field
        name="attributes.data_volume_type"
        options={props.volumeTypes}
        component={SimpleSelectField}
        validate={required}
        isClearable={true}
      />
    </CreateResourceFormGroup>
  ) : null;
