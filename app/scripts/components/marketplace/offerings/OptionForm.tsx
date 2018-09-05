import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Field, formValueSelector } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { FORM_ID, FIELD_TYPES } from './constants';
import { FormGroup } from './FormGroup';

const selector = formValueSelector(FORM_ID);

const connector = connect<any, any, {option: string}>((state, ownProps) => {
  const option = selector(state, ownProps.option);
  if (option.type) {
    return {type: option.type.value};
  } else {
    return {};
  }
});

const OptionNameField = props => (
  <Field
    name={`${props.option}.name`}
    type="text"
    className="form-control"
    component="input"
  />
);

const OptionLabelField = props => (
  <Field
    name={`${props.option}.label`}
    type="text"
    className="form-control"
    component="input"
  />
);

const OptionTypeField = props => (
  <Field
    name={`${props.option}.type`}
    component={fieldProps => (
      <Select
        value={fieldProps.input.value}
        onChange={value => fieldProps.input.onChange(value)}
        options={FIELD_TYPES}
        clearable={false}
      />
    )}
  />
);

export const OptionForm = connector(withTranslation(props => (
  <>
    <FormGroup label={props.translate('Name')}>
      <OptionNameField option={props.option}/>
    </FormGroup>
    <FormGroup label={props.translate('Label')}>
      <OptionLabelField option={props.option}/>
    </FormGroup>
    <FormGroup label={props.translate('Type')}>
      <OptionTypeField option={props.option}/>
    </FormGroup>
  </>
)));
