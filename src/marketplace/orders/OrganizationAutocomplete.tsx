import { FieldValidator } from 'final-form';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps extends Omit<
  FormField,
  'input' | 'meta'
> {
  name?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  reactSelectProps?: any;
  validator?: FieldValidator<any>;
  onChange?(value: any): void;
}

const getOptionValue = (option) => option.uuid;
const getOptionLabel = (option) => option.name;

export const OrganizationAutocomplete: FunctionComponent<
  OrganizationAutocompleteProps
> = (props) => {
  const loadOptions = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'abbreviation'],
        o: 'name',
      }),
    [],
  );
  // The Field `component` prop must be a stable reference. An inline
  // arrow here would be a fresh function on every parent render, causing
  // to unmount and re-mount the underlying AsyncSelect
  // each time — destroying focus, ongoing API calls, and the inner
  // `.metronic-select__control` DOM node. useCallback fixes this; props
  // that the inner closure depends on are listed in the deps array.
  const placeholder = props.placeholder || translate('Select organization...');
  const noOptionsMessage =
    props.noOptionsMessage || translate('No organizations');
  const reactSelectProps = props.reactSelectProps;

  const renderField = useCallback(
    (fieldProps) => (
      <AsyncSelect
        placeholder={placeholder}
        loadOptions={loadOptions}
        defaultOptions
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        value={fieldProps.input.value}
        onChange={(value) => {
          fieldProps.input.onChange(value);
          if (props.onChange) {
            props.onChange(value);
          }
        }}
        noOptionsMessage={() => noOptionsMessage}
        isClearable={true}
        inputId="organization-selector-input"
        {...reactSelectProps}
      />
    ),
    [placeholder, noOptionsMessage, reactSelectProps],
  );

  return (
    <Field
      name={props.name || 'organization'}
      validate={props.validator}
      component={renderField}
    />
  );
};
