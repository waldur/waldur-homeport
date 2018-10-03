import * as React from 'react';
import {AsyncCreatable, AutocompleteResult} from 'react-select';
import {Field, Validator} from 'redux-form';

import { FieldError } from '@waldur/form-react';
import {OptionDs} from '@waldur/form-react/autosuggest-field/OptionDs';

interface AutosuggestFieldProps {
  id: string;
  formFieldName: string;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  onSuggestionsFetchRequested: (value: string, callback: (err: any, result: AutocompleteResult<any>) => void) => void;
  onOptionSelected: (option: OptionDs) => void;
  validate?: Validator | Validator[];
}

export const AutosuggestField = (props: AutosuggestFieldProps) => {
  return (
    <Field name={props.formFieldName}
           placeholder={props.placeholder}
           required={props.required}
           validate={props.validate}
           component={fieldProps =>
             <>
               <AsyncCreatable
                 disabled={props.disabled}
                 multi={false}
                 value={fieldProps.input.value}
                 onChange={(option: OptionDs) => {
                   fieldProps.input.onChange(option);
                   props.onOptionSelected(option);
                 }}
                 loadOptions={props.onSuggestionsFetchRequested}/>
               <FieldError error={fieldProps.meta.error}/>
             </>
           }
    />
  );
};
