import { FieldValidator } from 'final-form';
import { FunctionComponent, useCallback } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { AsyncPaginate } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps extends FormField {
  name?: string;
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  reactSelectProps?: Partial<SelectProps>;
  validator?: FieldValidator<any>;
  onChange?(value: any): void;
}

const loadOptions = (query, prevOptions, { page }) =>
  organizationAutocomplete(query, prevOptions, page, {
    field: ['name', 'uuid', 'abbreviation'],
    o: 'name',
  });

const getOptionValue = (option) => option.uuid;
const getOptionLabel = (option) => option.name;

export const OrganizationAutocomplete: FunctionComponent<
  OrganizationAutocompleteProps
> = (props) => {
  // The Field `component` prop must be a stable reference. An inline
  // arrow here would be a fresh function on every parent render, causing
  // to unmount and re-mount the underlying AsyncPaginate
  // each time — destroying focus, ongoing API calls, and the inner
  // `.metronic-select__control` DOM node. useCallback fixes this; props
  // that the inner closure depends on are listed in the deps array.
  const placeholder = props.placeholder || translate('Select organization...');
  const noOptionsMessage =
    props.noOptionsMessage || translate('No organizations');
  const reactSelectProps = props.reactSelectProps;

  const renderField = useCallback(
    (fieldProps) => (
      <AsyncPaginate
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
