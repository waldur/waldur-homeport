import * as React from 'react';
import { Field } from 'redux-form';

import { InternalListField } from '@waldur/form-react/list-field/ListFieldInternal';
import { ListFieldParameters } from '@waldur/form-react/list-field/types';

export const ListField = (params: ListFieldParameters) => {
  return (
    <div className="form-group">
      <label className="control-label col-sm-2">{params.label}</label>
      <div className="col-sm-5 same-padding-as-control-label">
        <Field name={params.formFieldName}
               component={fieldProps =>
                 <InternalListField configuration={params.configuration}
                                    selectedOption={fieldProps.input.value}
                                    onOptionSelected={newValue => fieldProps.input.onChange(newValue)}/>}
        />
        {params.description && <p className="help-block m-b-none text-muted">{params.description}</p>}
      </div>
    </div>
  );
};
