import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
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
    if (option?.type) {
      return { type: option.type.value };
    } else {
      return {};
    }
  },
);

const StringField: FunctionComponent<any> = (props) => (
  <Field
    name={`${props.option}.${props.name}`}
    type="text"
    component={InputField}
    validate={props.validate}
    readOnly={props.readOnly}
  />
);

const RequiredField = (props: { option: string; readOnly?: boolean }) => (
  <Field
    name={`${props.option}.required`}
    component={AwesomeCheckboxField}
    label={translate('Required')}
    disabled={props.readOnly}
  />
);

const OptionTypeField: FunctionComponent<any> = (props) => (
  <Field
    name={`${props.option}.type`}
    validate={props.validate}
    component={(fieldProps) => (
      <Select
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        options={FIELD_TYPES}
        isClearable={false}
        isDisabled={props.readOnly}
      />
    )}
  />
);

const MinMaxFields = (props: { option: string; readOnly?: boolean }) => (
  <>
    <FormGroup label={translate('Minimal value')}>
      <Field
        name={`${props.option}.min`}
        type="number"
        component={InputField}
        readOnly={props.readOnly}
      />
    </FormGroup>
    <FormGroup label={translate('Maximal value')}>
      <Field
        name={`${props.option}.max`}
        type="number"
        component={InputField}
        readOnly={props.readOnly}
      />
    </FormGroup>
  </>
);

interface OptionFormProps {
  option: string;
  type: FieldType;
  readOnly?: boolean;
}

export const OptionForm = connector((props: OptionFormProps) => {
  return (
    <>
      <InternalNameField
        name={`${props.option}.name`}
        readOnly={props.readOnly}
      />
      <DisplayNameField
        name={`${props.option}.label`}
        readOnly={props.readOnly}
      />
      <FormGroup label={translate('Description')}>
        <StringField
          option={props.option}
          name="help_text"
          readOnly={props.readOnly}
        />
      </FormGroup>
      <FormGroup label={translate('Type')} required={true}>
        <OptionTypeField
          option={props.option}
          validate={required}
          readOnly={props.readOnly}
        />
      </FormGroup>
      {(props.type === 'integer' || props.type === 'money') && (
        <MinMaxFields option={props.option} readOnly={props.readOnly} />
      )}
      {(props.type === 'select_string' ||
        props.type === 'select_string_multi') && (
        <FormGroup
          label={translate('Choices as comma-separated list')}
          required={true}
        >
          <StringField
            option={props.option}
            name="choices"
            validate={required}
            readOnly={props.readOnly}
          />
        </FormGroup>
      )}
      {props.type === 'string' && (
        <FormGroup label={translate('Default value')}>
          <StringField
            option={props.option}
            name="default"
            readOnly={props.readOnly}
          />
        </FormGroup>
      )}
      <FormGroup>
        <RequiredField option={props.option} readOnly={props.readOnly} />
      </FormGroup>
    </>
  );
});
