import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { Option, getOfferingTypes } from '@/marketplace/common/registry';

export const OfferingTypeAutocomplete: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
  options?: Option[];
}> = (props) => {
  const renderComponent = (fieldProps) => (
    <Select
      placeholder={translate('Select integration type...')}
      options={props.options ?? getOfferingTypes()}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      isClearable={true}
      {...props.reactSelectProps}
    />
  );

  return <Field name="offering_type" component={renderComponent} />;
};
