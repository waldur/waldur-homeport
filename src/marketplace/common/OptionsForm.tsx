import { FC, useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';
import { OfferingOptions } from 'waldur-js-client';

import {
  AttributeValidator,
  composeValidators,
  greaterThanField,
  greaterThanOrEqualField,
  lessThanField,
  lessThanOrEqualField,
  required,
} from '@/core/validators';
import {
  FormGroup,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { FormFieldError } from '@/form/FormFieldError';
import { FormGroupProps } from '@/form/FormGroup';
import { AsyncSelectField } from '@/form/select/AsyncSelectField';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { TimeSelectField } from '@/form/TimeSelectField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { INSTANCE_TYPE, TENANT_TYPE } from '@/openstack/constants';
import { useCustomer } from '@/workspace/hooks';

import { ComponentMultiplierField } from './ComponentMultiplierField';
import { ConditionalCascadeField } from './ConditionalCascadeField';
import { fetchOpenstackOptions } from './fetchOpenstackOptions';
import { validateMultiDatacenterConfiguration } from './multi-datacenter-k8s-types';
import { MultiDatacenterK8sConfigurationForm } from './MultiDatacenterK8sConfigurationForm';
import { SingleDatacenterK8sConfigurationForm } from './SingleDatacenterK8sConfigurationForm';
import { StorageFolderManagerField } from './StorageFolderManagerField';
import { DeployFormData } from './types';

// Validator for K8s configuration fields - returns array for proper tooltip formatting
const validateK8sConfig = (value) => {
  if (!value) return undefined;
  const errors = validateMultiDatacenterConfiguration(value);
  if (errors.length > 0) {
    return errors;
  }
  return undefined;
};

/**
 * The K8s forms render their own titled card (`K8sOptionCard`), so the enclosing
 * `FormGroup` must not draw a label row of its own — otherwise the option shows
 * up as a stray asterisk and help icon with no field name next to them.
 */
const getK8sParams = (option) => ({
  hideLabel: true,
  // The generic `FormFieldError` only renders once a field is touched, and
  // these forms never blur an input; `K8sOptionCard` renders `meta.error`.
  hideError: true,
  field: option,
  // Cluster completeness (infrastructure and flavour per node group) is only
  // enforced when the provider marked the option mandatory. An optional K8s
  // option must never block the form — and since `OptionsForm` is also used by
  // the resource option dialogs, which have no place to surface a blocked
  // submit, that would leave every other option in the form unsavable too.
  validate: option.required ? validateK8sConfig : undefined,
});

const VALIDATOR_MAPPING = {
  gt: greaterThanField,
  gte: greaterThanOrEqualField,
  lt: lessThanField,
  lte: lessThanOrEqualField,
};

/**
 * Builds a validator function for an option field, including cross-field validation.
 * @param option - The option field configuration
 * @param options - All options (to get labels for target fields)
 * @param allValues - All form values for cross-field validation
 * @param customValidator - Optional custom validator from params
 */
export const buildOptionValidator = (
  option: any,
  options: any,
  allValues: Record<string, any>,
  customValidator?: (value: any) => any,
) => {
  const validators: Array<(value: any) => any> = [];

  // Add custom validator if provided (e.g., K8s config validator)
  if (customValidator) {
    validators.push(customValidator);
  }

  // Boolean fields skip `required`: an unchecked switch is undefined, which
  // `required` rejects, silently blocking submission.
  if (option.required && option.type !== 'boolean') {
    validators.push(required);
  }

  // Add cross-field validators
  if (option.validators && Array.isArray(option.validators)) {
    option.validators.forEach((validator: AttributeValidator) => {
      const targetOption = options.options?.[validator.target_field];
      const targetLabel = targetOption?.label;

      const validatorFn = VALIDATOR_MAPPING[validator.type];
      if (validatorFn) {
        validators.push(
          validatorFn(validator.target_field, allValues, targetLabel),
        );
      }
    });
  }

  if (validators.length === 0) {
    return undefined;
  }

  if (validators.length === 1) {
    return validators[0];
  }

  return composeValidators(...validators);
};

export const getComponentAndParams = (option, key, customer, loaders?: any) => {
  let OptionField: FC<Partial<FormGroupProps>> = StringField;
  let params: Record<string, any> = {};
  switch (option.type) {
    case 'text':
      OptionField = TextField;
      break;

    case 'select_string':
      OptionField = SelectField;
      params = {
        options: option.choices.map((item) => ({
          label: item,
          value: item,
        })),
        noUpdateOnBlur: true,
        simpleValue: true,
      };
      break;

    case 'select_string_multi':
      OptionField = SelectMultiBooleanGroup;
      params = {
        options: option.choices,
      };
      break;

    case 'boolean':
      OptionField = AwesomeCheckboxField;
      params = {
        hideLabel: true,
        help_text: option.help_text,
        tooltip: '',
      };
      break;

    case 'integer':
      OptionField = NumberField;
      params = {
        parse: parseIntField,
        format: formatIntField,
      };
      break;
    case 'date':
      OptionField = DateField;
      break;
    case 'time':
      OptionField = TimeSelectField;
      break;
    case 'select_openstack_tenant':
      OptionField = AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: loaders?.loadTenants,
        getOptionLabel: (option) => `${option.project_name} / ${option.name}`,
        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select tenant...'),
      };
      break;
    case 'select_multiple_openstack_tenants':
      OptionField = AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: loaders?.loadTenants,
        getOptionLabel: (option) => `${option.project_name} / ${option.name}`,
        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select tenants...'),
        isMulti: true,
      };
      break;
    case 'select_openstack_instance':
      OptionField = AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: loaders?.loadInstances,
        getOptionLabel: (option) => `${option.project_name} / ${option.name}`,
        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select instance...'),
      };
      break;
    case 'select_multiple_openstack_instances':
      OptionField = AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: loaders?.loadInstances,
        getOptionLabel: (option) => `${option.project_name} / ${option.name}`,
        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select instance...'),
        isMulti: true,
      };
      break;

    case 'conditional_cascade':
      OptionField = ConditionalCascadeField;
      params = {
        field: option,
      };
      break;
    case 'component_multiplier':
      OptionField = ComponentMultiplierField;
      params = {
        field: option,
      };
      break;
    case 'storage_folder_manager':
      OptionField = StorageFolderManagerField;
      params = {
        field: option,
      };
      break;

    case 'single_datacenter_k8s_config':
      OptionField = SingleDatacenterK8sConfigurationForm;
      params = getK8sParams(option);
      break;

    case 'multi_datacenter_k8s_config':
      OptionField = MultiDatacenterK8sConfigurationForm;
      params = getK8sParams(option);
      break;
  }

  return { OptionField, params };
};

/**
 * Inner component for react-final-form that uses useFormState for cross-field validation.
 * This is a separate component to ensure useFormState only subscribes when finalForm=true.
 */
export const OptionsForm = ({
  options,
  customer: preferedCustomer,
}: {
  options: OfferingOptions;
  customer?: DeployFormData['customer'];
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const selectedCustomer = useCustomer();
  const customer = preferedCustomer || selectedCustomer;

  const loadTenants = useMemo(
    () => fetchOpenstackOptions(TENANT_TYPE, customer?.uuid),
    [customer?.uuid],
  );

  const loadInstances = useMemo(
    () => fetchOpenstackOptions(INSTANCE_TYPE, customer?.uuid),
    [customer?.uuid],
  );

  return (
    <>
      {options.order &&
        options.order.map((key) => {
          const option = options.options[key];
          if (!option) {
            return null;
          }
          const { OptionField, params } = getComponentAndParams(
            option,
            key,
            customer,
            { loadTenants, loadInstances },
          );

          // Build validator with cross-field support
          const validateFn = buildOptionValidator(
            option,
            options,
            values,
            params.validate,
          );

          // Fields that render their own heading opt out of the whole
          // `FormGroup` label row: passing only `label={false}` would still
          // leave the required marker and the help tooltip behind.
          const hideLabel = Boolean(params.hideLabel);

          return (
            <FormGroup
              key={key}
              label={hideLabel ? undefined : option.label}
              help={hideLabel ? undefined : option.help_text}
              helpEnd
              required={hideLabel ? undefined : option.required}
            >
              {(() => {
                const { key: remountKey, ...fieldParams } = params;
                return (
                  <Field
                    key={remountKey}
                    name={`attributes.${key}`}
                    component={OptionField}
                    validate={validateFn}
                    {...fieldParams}
                    {...(OptionField === AwesomeCheckboxField
                      ? { label: option.label, help_text: option.help_text }
                      : {})}
                  />
                );
              })()}
              {!params.hideError && (
                <FormFieldError name={`attributes.${key}`} />
              )}
            </FormGroup>
          );
        })}
    </>
  );
};
