import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field, Validator } from 'redux-form';

import { FieldError } from '@waldur/form';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { callAutocomplete } from './api';

interface CallAutocompleteProps {
  protectedCalls?: boolean;
  className?: string;
  onChange?(value): any;
  showError?: boolean;
  validate?: Validator | Validator[];
  reactSelectProps?: Partial<SelectProps>;
}

export const CallAutocomplete: React.FC<CallAutocompleteProps> = (props) => (
  <Field
    name="call"
    validate={props.validate}
    onChange={props.onChange}
    component={(fieldProps) => (
      <>
        <AsyncPaginate
          placeholder={translate('Select call...')}
          loadOptions={(query, prevOptions, { page }) =>
            callAutocomplete(query, prevOptions, page, props.protectedCalls)
          }
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No calls')}
          isClearable={true}
          {...props.reactSelectProps}
        />
        {props.showError && fieldProps.meta.touched && (
          <FieldError error={fieldProps.meta.error} />
        )}
      </>
    )}
  />
);
