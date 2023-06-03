import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OptionField } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { DisplayNameField } from '../DisplayNameField';
import { FormGroup } from '../FormGroup';
import { InternalNameField } from '../InternalNameField';

import { FIELD_TYPES, OPTION_FORM_ID } from './constants';
import { FieldType } from './types';

const StringField: FunctionComponent<any> = (props) => (
  <Field
    name={props.name}
    type="text"
    component={InputField}
    validate={props.validate}
  />
);

const RequiredField = () => (
  <Field
    name="required"
    component={AwesomeCheckboxField}
    label={translate('Required')}
  />
);

const OptionTypeField: FunctionComponent<any> = (props) => (
  <Field
    name="type"
    validate={props.validate}
    component={(fieldProps) => (
      <Select
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        options={FIELD_TYPES}
        isClearable={false}
      />
    )}
  />
);

const MinMaxFields = () => (
  <>
    <FormGroup label={translate('Minimal value')}>
      <Field name="min" type="number" component={InputField} />
    </FormGroup>
    <FormGroup label={translate('Maximal value')}>
      <Field name="max" type="number" component={InputField} />
    </FormGroup>
  </>
);

interface OptionFormProps {
  type: FieldType;
}

const OptionForm = (props: OptionFormProps) => {
  return (
    <>
      <InternalNameField name="name" />
      <DisplayNameField name="label" />
      <FormGroup label={translate('Description')}>
        <StringField name="help_text" />
      </FormGroup>
      <FormGroup label={translate('Type')} required={true}>
        <OptionTypeField validate={required} />
      </FormGroup>
      {(props.type === 'integer' || props.type === 'money') && <MinMaxFields />}
      {(props.type === 'select_string' ||
        props.type === 'select_string_multi') && (
        <FormGroup
          label={translate('Choices as comma-separated list')}
          required={true}
        >
          <StringField name="choices" validate={required} />
        </FormGroup>
      )}
      {props.type === 'string' && (
        <FormGroup label={translate('Default value')}>
          <StringField name="default" />
        </FormGroup>
      )}
      <FormGroup>
        <RequiredField />
      </FormGroup>
    </>
  );
};

const selector = formValueSelector(OPTION_FORM_ID);

export const OptionFormDialog = reduxForm<
  OptionField,
  { onSubmit; onRemove; readOnly }
>({
  form: OPTION_FORM_ID,
})((props) => {
  const type = useSelector((state) => selector(state, 'type'));

  const isEdit = !!props.initialValues;

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <ModalDialog
        title={translate('User input variable')}
        footer={
          <>
            <CloseDialogButton />
            {isEdit && (
              <Button
                disabled={props.readOnly}
                variant="light-danger"
                onClick={props.onRemove}
              >
                {translate('Delete')}
              </Button>
            )}
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Save') : translate('Create')}
            />
          </>
        }
      >
        <OptionForm type={type?.value} />
      </ModalDialog>
    </form>
  );
});
