import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getOfferingTypes } from '@waldur/marketplace/common/registry';

export const OfferingTypeAutocomplete: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="offering_type"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select integration type...')}
        options={getOfferingTypes()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...props.reactSelectProps}
      />
    )}
  />
);
