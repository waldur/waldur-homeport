import { FunctionComponent } from 'react';
import { InputGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { NumberField } from '@waldur/form';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

const IntegerField = renderValidationWrapper((fieldProps) => (
  <InputGroup style={{ maxWidth: 200, zIndex: 0 }}>
    <NumberField min={1} max={1 * 10240} {...fieldProps.input} />
    <InputGroup.Text>GB</InputGroup.Text>
  </InputGroup>
));

export const SystemVolumeSizeGroup: FunctionComponent = () => (
  <CreateResourceFormGroup
    label={translate('System volume size')}
    required={true}
  >
    <Field
      name="attributes.system_volume_size"
      validate={required}
      component={IntegerField}
      format={(v) => (v ? v / 1024 : '')}
      normalize={(v) => Number(v) * 1024}
    />
  </CreateResourceFormGroup>
);
