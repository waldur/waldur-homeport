import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { FieldError } from './FieldError';

const renderField = ({input, required, label, meta: {error}, children, ...rest}) => (
  <div className="form-group">
    <label className="control-label">
      {label}{required && <span className="text-danger"> *</span>}
    </label>
    {children({ input, ...rest })}
    <FieldError error={error}/>
  </div>
);

const wrapField = Component => props => (
  <Field {...props} component={renderField}>
    {Component}
  </Field>
);

export const StringField = wrapField(({input}) => (
  <input {...input} type="text" className="form-control"/>
));

export const TextField = wrapField(({input}) =>
  <textarea {...input} rows={5} className="form-control"/>
);

export const SelectField = options => wrapField(({input, ...rest}) =>
  <Select
    {...rest}
    name={input.name}
    value={input.value}
    onChange={value => input.onChange(value)}
    onBlur={() => input.onBlur(input.value)}
    {...options}
  />
);
