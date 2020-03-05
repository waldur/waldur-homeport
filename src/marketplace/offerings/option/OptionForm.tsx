import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Field, formValueSelector } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { required } from '@waldur/core/validators';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';

import { DisplayNameField } from '../DisplayNameField';
import { FormGroup } from '../FormGroup';
import { InternalNameField } from '../InternalNameField';

import { FIELD_TYPES } from './constants';
import { FieldType } from './types';

const selector = formValueSelector(FORM_ID);

const connector = connect<{ type?: string }, {}, { option: string }>(
  (state, ownProps) => {
    const option = selector(state, ownProps.option);
    if (option.type) {
      return { type: option.type.value };
    } else {
      return {};
    }
  },
);

const StringField = props => (
  <Field
    name={`${props.option}.${props.name}`}
    type="text"
    className="form-control"
    component="input"
    validate={props.validate}
  />
);

const RequiredField = withTranslation(
  (props: TranslateProps & { option: string }) => (
    <Field
      name={`${props.option}.required`}
      component={fieldProps => (
        <AwesomeCheckbox
          id={`${props.option}.required`}
          label={props.translate('Required')}
          {...fieldProps.input}
        />
      )}
    />
  ),
);

const OptionTypeField = props => (
  <Field
    name={`${props.option}.type`}
    validate={props.validate}
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

const MinMaxFields = withTranslation(
  (props: TranslateProps & { option: string }) => (
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
  ),
);

interface OptionFormProps extends TranslateProps {
  option: string;
  type: FieldType;
}

export const OptionForm = connector(
  withTranslation((props: OptionFormProps) => (
    <>
      <InternalNameField name={`${props.option}.name`} />
      <DisplayNameField name={`${props.option}.label`} />
      <FormGroup label={props.translate('Description')}>
        <StringField option={props.option} name="help_text" />
      </FormGroup>
      <FormGroup label={props.translate('Type')} required={true}>
        <OptionTypeField option={props.option} validate={required} />
      </FormGroup>
      {(props.type === 'integer' || props.type === 'money') && (
        <MinMaxFields option={props.option} />
      )}
      {props.type === 'select_string' && (
        <FormGroup
          label={props.translate('Choices as comma-separated list')}
          required={true}
        >
          <StringField
            option={props.option}
            name="choices"
            validate={required}
          />
        </FormGroup>
      )}
      {props.type === 'string' && (
        <FormGroup label={props.translate('Default value')}>
          <StringField option={props.option} name="default" />
        </FormGroup>
      )}
      <FormGroup>
        <RequiredField option={props.option} />
      </FormGroup>
    </>
  )),
);
