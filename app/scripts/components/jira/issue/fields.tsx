import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { withLabel } from './utils';

export const StringField = withLabel(props => (
  <Field
    {...props}
    component="input"
    type="text"
    className="form-control"
  />
));

export const TextField = withLabel(props => (
  <Field
    {...props}
    component="textarea"
    rows={5}
    className="form-control"
  />
));

export const SelectField = withLabel(props => (
  <Field
    {...props}
    component={ownProps =>
      <Select
        {...ownProps}
        name={ownProps.input.name}
        value={ownProps.input.value}
        onChange={value => ownProps.input.onChange(value)}
        onBlur={() => ownProps.input.onBlur(ownProps.input.value)}
        {...props.componentProps}
      />
    }
  />
));
