import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CronField } from '@waldur/form/CronField';
import { DateField } from '@waldur/form/DateField';
import { MonacoField } from '@waldur/form/MonacoField';
import { NumberField } from '@waldur/form/NumberField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { SelectField } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/SelectField';

import { RESOURCE_ACTION_FORM } from './constants';

interface ResourceActionDialogOwnProps {
  submitForm(formData): void;
  dialogTitle: string;
  fields: any[];
  loading?: boolean;
  error?: Error;
}

const validateJSON = (value: string) => {
  try {
    JSON.parse(value);
  } catch (e) {
    return translate('This value is invalid JSON.');
  }
};

export const ResourceActionDialog = reduxForm<{}, ResourceActionDialogOwnProps>(
  { form: RESOURCE_ACTION_FORM },
)(
  ({
    submitForm,
    handleSubmit,
    submitting,
    invalid,
    dialogTitle,
    loading,
    error,
    fields,
  }) => {
    return (
      <ActionDialog
        title={dialogTitle}
        submitLabel={translate('Submit')}
        onSubmit={handleSubmit(submitForm)}
        submitting={submitting}
        invalid={invalid}
        layout="vertical"
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data.')
        ) : (
          fields.map((field, index) => {
            const props = {
              key: index,
              name: field.name,
              label: field.label,
              required: field.required,
              description: field.help_text,
            };
            if (field.component) {
              return <field.component key={index} />;
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
                <NumberField
                  {...props}
                  min={field.minValue}
                  max={field.maxValue}
                />
              );
            } else if (field.type === 'boolean') {
              return <AwesomeCheckboxField hideLabel={true} {...props} />;
            } else if (field.type === 'select') {
              return <SelectField {...props} options={field.options} />;
            } else if (field.type === 'async_select') {
              return (
                <AsyncSelectField
                  {...props}
                  loadOptions={field.loadOptions}
                  {...reactSelectMenuPortaling()}
                />
              );
            }
          })
        )}
      </ActionDialog>
    );
  },
);
