import { useCallback } from 'react';
import { reduxForm } from 'redux-form';

import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { SelectField, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { MonacoField } from '@waldur/form/MonacoField';
import { NumberField } from '@waldur/form/NumberField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { RESOURCE_ACTION_FORM } from './constants';

interface ResourceActionDialogOwnProps {
  submitForm(formData): void;
  dialogTitle: string;
  dialogFullButtons?: boolean;
  dialogSubmitLabel?: string;
  formFields?: any[];
  loading?: boolean;
  error?: Error;
  refetch?(): void;
}

const validateJSON = (value: string) => {
  try {
    JSON.parse(value);
  } catch {
    return translate('This value is invalid JSON.');
  }
};

export const ResourceActionDialog = reduxForm<{}, ResourceActionDialogOwnProps>(
  {
    form: RESOURCE_ACTION_FORM,
  },
)(({
  submitForm,
  handleSubmit,
  submitting,
  invalid,
  dialogTitle,
  dialogFullButtons,
  dialogSubmitLabel = translate('Submit'),
  loading,
  error,
  refetch,
  formFields: fields,
  change,
}) => {
  const getFieldComponent = useCallback((field, index, { key, ...props }) => {
    if (field.component) {
      return (
        <field.component
          key={key}
          {...props}
          {...(field.extraProps || {})}
          change={change}
        />
      );
    } else if (field.type === 'string') {
      return (
        <StringField
          key={key}
          {...props}
          maxLength={field.maxlength}
          pattern={field.pattern?.source}
          validate={field.validate}
          autoFocus={index === 0}
        />
      );
    } else if (field.type === 'text') {
      return <TextField key={key} {...props} maxLength={field.maxlength} />;
    } else if (field.type === 'json') {
      return (
        <MonacoField
          key={key}
          {...props}
          language="json"
          validate={validateJSON}
          height={300}
        />
      );
    } else if (field.type === 'datetime') {
      return <DateTimeField key={key} {...props} />;
    } else if (field.type === 'timezone') {
      return <TimezoneField key={key} {...props} />;
    } else if (field.type === 'integer') {
      return (
        <NumberField
          key={key}
          {...props}
          min={field.minValue}
          max={field.maxValue}
        />
      );
    } else if (field.type === 'boolean') {
      return <AwesomeCheckboxField hideLabel={true} key={key} {...props} />;
    } else if (field.type === 'select') {
      return (
        <SelectField
          key={key}
          {...props}
          options={field.options}
          simpleValue={true}
        />
      );
    } else if (field.type === 'async_select') {
      return (
        <AsyncSelectField
          key={key}
          {...props}
          {...field.extraProps}
          loadOptions={field.loadOptions}
          getOptionLabel={field.getOptionLabel}
          getOptionValue={field.getOptionValue}
          isMulti={field.isMulti}
          isClearable={field.isClearable}
        />
      );
    } else if (field.type === 'radio') {
      return (
        <CustomRadioButton
          key={key}
          {...props}
          choices={field.choices}
          direction={field.direction}
          align={field.align}
        />
      );
    }
  }, []);

  return (
    <ActionDialog
      title={dialogTitle}
      submitLabel={dialogSubmitLabel}
      onSubmit={handleSubmit(submitForm)}
      submitting={submitting}
      invalid={invalid}
      fullButtons={dialogFullButtons}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        fields.map((field, index) => {
          const props = {
            key: index,
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            description: field.help_text,
            disabled: field.disabled,
            disabled_tooltip: field.disabled_tooltip,
            spaceless: field.spaceless,
          };
          return field.disabled && props.disabled_tooltip ? (
            <Tip
              key={index}
              label={props.disabled_tooltip}
              id="resource-action-dialog-disabled-tooltip"
            >
              {getFieldComponent(field, index, props)}
            </Tip>
          ) : (
            getFieldComponent(field, index, props)
          );
        })
      )}
    </ActionDialog>
  );
});
