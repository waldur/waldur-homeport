import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';

import { LoadingErred } from '@/core/LoadingErred';
import { Tip } from '@/core/Tooltip';
import { composeValidators } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  RadioGroup,
  DateTimeGroup,
  MonacoGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
  TextGroup,
  TimezoneGroup,
} from '@/form';
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
  const { change } = useForm();
  const { values } = useFormState();

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
          <StringGroup
            key={key}
            name={props.name}
            {...props}
            maxLength={field.maxlength}
            pattern={field.pattern?.source}
            autoFocus={index === 0}
          />
        );
      } else if (field.type === 'text') {
        return (
          <TextGroup
            key={key}
            name={props.name}
            {...props}
            maxLength={field.maxlength}
          />
        );
      } else if (field.type === 'json') {
        return (
          <MonacoGroup
            key={key}
            name={props.name}
            {...props}
            language="json"
            validate={validateJSON}
            height={300}
          />
        );
      } else if (field.type === 'datetime') {
        return <DateTimeGroup key={key} name={props.name} {...props} />;
      } else if (field.type === 'timezone') {
        return <TimezoneGroup key={key} name={props.name} {...props} />;
      } else if (field.type === 'integer') {
        return (
          <NumberGroup
            key={key}
            name={props.name}
            {...props}
            min={field.minValue}
            max={field.maxValue}
          />
        );
      } else if (field.type === 'boolean') {
        return (
          <BooleanGroup
            key={key}
            name={props.name}
            hideLabel={true}
            {...props}
          />
        );
      } else if (field.type === 'select') {
        return (
          <SelectGroup
            key={key}
            name={props.name}
            {...props}
            options={field.options}
            simpleValue={true}
          />
        );
      } else if (field.type === 'async_select') {
        return (
          <AsyncSelectGroup
            key={key}
            name={props.name}
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
          <RadioGroup
            key={key}
            name={props.name}
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
