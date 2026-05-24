import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { LoadingErred } from '@/core/LoadingErred';
import { Tip } from '@/core/Tooltip';
import { composeValidators } from '@/core/validators';
import { SelectField, StringField, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateTimeField } from '@/form/DateTimeField';
import { MonacoField } from '@/form/MonacoField';
import { NumberField } from '@/form/NumberField';
import { AsyncSelect as AsyncSelectField } from '@/form/select';
import { TimezoneField } from '@/form/TimezoneField';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';

interface ResourceActionDialogProps {
  submitForm(formData): void;
  dialogTitle: string;
  dialogFullButtons?: boolean;
  dialogSubmitLabel?: string;
  formFields?: any[] | ((values: any) => any[]);
  initialValues?: any;
  loading?: boolean;
  error?: Error;
  refetch?(): void;
}

const validateJSON = (value: string) => {
  try {
    if (value) {
      JSON.parse(value);
    }
  } catch {
    return translate('This value is invalid JSON.');
  }
};

const ResourceActionDialogInner: FC<any> = ({
  handleSubmit,
  submitting,
  invalid,
  dialogTitle,
  dialogFullButtons,
  dialogSubmitLabel = translate('Submit'),
  loading,
  error,
  refetch,
  formFields,
}) => {
  const form = useForm();
  const { values } = useFormState();
  const change = useCallback((name, value) => form.change(name, value), [form]);

  const fields = useMemo(
    () => (typeof formFields === 'function' ? formFields(values) : formFields),
    [formFields, values],
  );

  const getFieldComponent = useCallback(
    (field, index, { key, ...props }) => {
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
          <AwesomeRadioButton
            key={key}
            {...props}
            choices={field.choices}
            direction={field.direction}
            justify={field.justify}
          />
        );
      }
    },
    [change],
  );

  return (
    <ActionDialogFinal
      title={dialogTitle}
      submitLabel={dialogSubmitLabel}
      onSubmit={handleSubmit}
      submitting={submitting}
      invalid={invalid}
      fullButtons={dialogFullButtons}
      loading={loading}
    >
      {error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        fields.map((field, index) => {
          const props = {
            key: index,
            name: field.name,
            label: field.label,
            hideLabel: field.hideLabel,
            placeholder: field.placeholder,
            required: field.required,
            description: field.help_text,
            disabled: field.disabled,
            disabled_tooltip: field.disabled_tooltip,
            spaceless: field.spaceless,
            validate: Array.isArray(field.validate)
              ? composeValidators(...field.validate)
              : field.validate,
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
    </ActionDialogFinal>
  );
};

export const ResourceActionDialog: FC<ResourceActionDialogProps> = (props) => (
  <Form
    onSubmit={props.submitForm}
    initialValues={props.initialValues}
    mutators={{ ...arrayMutators }}
    render={(formProps) => (
      <ResourceActionDialogInner {...props} {...formProps} />
    )}
  />
);
