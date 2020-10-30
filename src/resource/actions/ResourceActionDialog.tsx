import * as React from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm, initialize } from 'redux-form';

import { StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CronField } from '@waldur/form/CronField';
import { DateField } from '@waldur/form/DateField';
import { MonacoField } from '@waldur/form/MonacoField';
import { NumberField } from '@waldur/form/NumberField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { ResourceAction } from './types';

interface ResourceActionDialogOwnProps {
  resolve: { action: ResourceAction; resource: any };
}

export const RESOURCE_ACTION_FORM = 'ResourceActionDialog';

const validateJSON = (value: string) => {
  try {
    JSON.parse(value);
  } catch (e) {
    return translate('This value is invalid JSON.');
  }
};

export const ResourceActionDialog = reduxForm<{}, ResourceActionDialogOwnProps>(
  { form: RESOURCE_ACTION_FORM },
)(({ resolve: { action, resource }, handleSubmit, submitting, invalid }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (action.getInitialValues) {
      const initialValues = action.getInitialValues();
      dispatch(initialize(RESOURCE_ACTION_FORM, initialValues));
    }
  }, [dispatch, action, resource]);

  const callback = (formData) => action.submitForm(dispatch, formData);
  return (
    <ActionDialog
      title={action.dialogTitle || action.title}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit(callback)}
      submitting={submitting}
      invalid={invalid}
      layout="vertical"
    >
      {Object.keys(action.fields).map((key) => {
        const field = action.fields[key];
        const props = {
          key: key,
          name: key,
          label: field.label,
          required: field.required,
          description: field.help_text,
        };
        if (field.component) {
          return <field.component key={key} />;
        } else if (field.type === 'string') {
          return (
            <StringField
              {...props}
              maxLength={field.maxlength}
              pattern={field.pattern?.source}
            />
          );
        } else if (field.type === 'text') {
          return <TextField {...props} maxLength={field.maxlength} />;
        } else if (field.type === 'json') {
          return (
            <MonacoField
              {...props}
              mode="json"
              validate={validateJSON}
              height={300}
            />
          );
        } else if (field.type === 'datetime') {
          return <DateField {...props} />;
        } else if (field.type === 'timezone') {
          return <TimezoneField {...props} />;
        } else if (field.type === 'crontab') {
          return <CronField {...props} />;
        } else if (field.type === 'integer') {
          return (
            <NumberField {...props} min={field.minValue} max={field.maxValue} />
          );
        } else if (field.type === 'boolean') {
          return <AwesomeCheckboxField hideLabel={true} {...props} />;
        }
      })}
    </ActionDialog>
  );
});
