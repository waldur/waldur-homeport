import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Field, formValueSelector } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { withTranslation, TranslateProps } from '@waldur/i18n';

import { FORM_ID, FIELD_TYPES } from './constants';
import { FormGroup } from './FormGroup';
import { FieldType } from './types';

const selector = formValueSelector(FORM_ID);

const connector = connect<any, any, {option: string}>((state, ownProps) => {
  const option = selector(state, ownProps.option);
  if (option.type) {
    return {type: option.type.value};
  } else {
    return {};
  }
});

const StringField = props => (
  <Field
    name={`${props.option}.${props.name}`}
    type="text"
    className="form-control"
    component="input"
  />
);

const RequiredField = withTranslation(props => (
  <Field
    name={`${props.option}.required`}
    component={fieldProps => (
      <AwesomeCheckbox
        id="required"
        label={props.translate('Required')}
        {...fieldProps.input}
      />
    )}
  />
));

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

const MinMaxFields = withTranslation(props => (
  <>
    <FormGroup label={props.translate('Minimal value')}>
      <Field
        name={`${props.option}.min`}
        type="number"
        className="form-control"
        component="input"
      />
    </FormGroup>
    <FormGroup label={props.translate('Maximal value')}>
      <Field
        name={`${props.option}.max`}
        type="number"
        className="form-control"
        component="input"
      />
    </FormGroup>
  </>
));

interface OptionFormProps extends TranslateProps {
  option: string;
  type: FieldType;
}

export const OptionForm = connector(withTranslation((props: OptionFormProps) => (
  <>
    <FormGroup label={props.translate('Name')}>
      <StringField option={props.option} name="name"/>
    </FormGroup>
    <FormGroup label={props.translate('Label')}>
      <StringField option={props.option} name="label"/>
    </FormGroup>
    <FormGroup label={props.translate('Description')}>
      <StringField option={props.option} name="help_text"/>
    </FormGroup>
    <FormGroup label={props.translate('Type')}>
      <OptionTypeField option={props.option}/>
    </FormGroup>
    {(props.type === 'integer' || props.type === 'money') && (
      <MinMaxFields option={props.option}/>
    )}
    {props.type === 'select_string' && (
      <FormGroup label={props.translate('Choices as comma-separated list')}>
        <StringField option={props.option} name="choices"/>
      </FormGroup>
    )}
    {props.type === 'string' && (
      <FormGroup label={props.translate('Default value')}>
        <StringField option={props.option} name="default"/>
      </FormGroup>
    )}
    <FormGroup>
      <RequiredField option={props.option}/>
    </FormGroup>
  </>
)));
