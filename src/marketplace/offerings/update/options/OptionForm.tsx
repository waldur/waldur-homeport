import { useSelector } from 'react-redux';
import { Field, getFormValues } from 'redux-form';

import { required } from '@waldur/core/validators';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { DisplayNameField } from '../../DisplayNameField';
import { FormGroup } from '../../FormGroup';
import { InternalNameField } from '../../InternalNameField';

import { FIELD_TYPES, OPTION_FORM_ID } from './constants';

const selector = getFormValues(OPTION_FORM_ID);

const TypeGroup = () => (
  <FormGroup label={translate('Type')} required={true}>
    <Field
      name="type"
      validate={required}
      component={(fieldProps) => (
        <Select
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          options={FIELD_TYPES}
          isClearable={false}
        />
      )}
    />
  </FormGroup>
);

export const OptionForm = ({ resourceType }) => {
  const optionValue = useSelector(selector) as any;
  const type = optionValue.type.value;

  return (
    <>
      <InternalNameField name="name" />
      <DisplayNameField name="label" />
      <FormGroup label={translate('Description')}>
        <Field name="help_text" type="text" component={InputField} />
      </FormGroup>
      <TypeGroup />
      {(type === 'integer' || type === 'money') && (
        <>
          <FormGroup label={translate('Minimal value')}>
            <Field name="min" type="number" component={InputField} />
          </FormGroup>
          <FormGroup label={translate('Maximal value')}>
            <Field name="max" type="number" component={InputField} />
          </FormGroup>
        </>
      )}
      {(type === 'select_string' || type === 'select_string_multi') && (
        <FormGroup
          label={translate('Choices as comma-separated list')}
          required={true}
        >
          <Field
            name="choices"
            type="text"
            component={InputField}
            validate={required}
          />
        </FormGroup>
      )}
      {type === 'string' && (
        <FormGroup label={translate('Default value')}>
          <Field name="default" type="text" component={InputField} />
        </FormGroup>
      )}
      {resourceType === 'options' ? (
        <FormGroup>
          <Field
            name="required"
            component={AwesomeCheckboxField}
            label={translate('Required')}
          />
        </FormGroup>
      ) : null}
    </>
  );
};
