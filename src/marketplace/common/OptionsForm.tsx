import { FC } from 'react';
import { Field } from 'react-final-form';
import { useSelector } from 'react-redux';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import {
  AsyncSelectField,
  AsyncSelectFieldFinal,
} from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { FormGroupProps } from '@waldur/form/FormGroup';
import { SelectMultiCheckboxGroup } from '@waldur/form/SelectMultiCheckboxGroup';
import { TimeSelectField } from '@waldur/form/TimeSelectField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import { getCustomer } from '@waldur/workspace/selectors';

import { FormGroup } from '../offerings/FormGroup';
import { Offering } from '../types';
import { isExperimentalUiComponentsVisible } from '../utils';

import { ComponentMultiplierField } from './ComponentMultiplierField';
import { ConditionalCascadeField } from './ConditionalCascadeField';
import { fetchOpenstackOptions } from './fetchOpenstackOptions';
import { validateMultiDatacenterConfiguration } from './multi-datacenter-k8s-types';
import { MultiDatacenterK8sConfigurationForm } from './MultiDatacenterK8sConfigurationForm';
import { SingleDatacenterK8sConfigurationForm } from './SingleDatacenterK8sConfigurationForm';
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

interface OptionsFormProps {
  options: Offering['options'];
  submitting?: boolean;
  customer?: DeployFormData['customer'];
  finalForm?: boolean;
}

const getComponentAndParams = (option, key, customer, finalForm = false) => {
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
      OptionField = SelectMultiCheckboxGroup;
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
      OptionField = finalForm ? AsyncSelectFieldFinal : AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: (query, prevOptions, currentPage) =>
          fetchOpenstackOptions(
            query,
            TENANT_TYPE,
            prevOptions,
            currentPage,
            customer?.uuid,
          ),

        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select tenant...'),
      };
      break;
    case 'select_multiple_openstack_tenants':
      OptionField = finalForm ? AsyncSelectFieldFinal : AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: (query, prevOptions, currentPage) =>
          fetchOpenstackOptions(
            query,
            TENANT_TYPE,
            prevOptions,
            currentPage,
            customer?.uuid,
          ),

        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select tenants...'),
        isMulti: true,
      };
      break;
    case 'select_openstack_instance':
      OptionField = finalForm ? AsyncSelectFieldFinal : AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: (query, prevOptions, currentPage) =>
          fetchOpenstackOptions(
            query,
            INSTANCE_TYPE,
            prevOptions,
            currentPage,
            customer?.uuid,
          ),

        getOptionValue: (option) => option.backend_id,
        placeholder: translate('Select instance...'),
      };
      break;
    case 'select_multiple_openstack_instances':
      OptionField = finalForm ? AsyncSelectFieldFinal : AsyncSelectField;
      params = {
        key: key + '-' + customer?.uuid,
        loadOptions: (query, prevOptions, currentPage) =>
          fetchOpenstackOptions(
            query,
            INSTANCE_TYPE,
            prevOptions,
            currentPage,
            customer?.uuid,
          ),

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

    case 'single_datacenter_k8s_config':
      if (isExperimentalUiComponentsVisible()) {
        OptionField = SingleDatacenterK8sConfigurationForm;
        params = {
          hideLabel: true,
          hideHelp: true,
          hideError: true, // Errors shown in Progress block
          field: option,
          validate: validateK8sConfig,
        };
      }
      break;

    case 'multi_datacenter_k8s_config':
      if (isExperimentalUiComponentsVisible()) {
        OptionField = MultiDatacenterK8sConfigurationForm;
        params = {
          hideLabel: true,
          hideHelp: true,
          hideError: true, // Errors shown in Progress block
          field: option,
          validate: validateK8sConfig,
        };
      }
      break;
  }

  return { OptionField, params };
};

export const OptionsForm = ({
  options,
  submitting,
  customer: preferedCustomer,
  finalForm,
}: OptionsFormProps) => {
  const selectedCustomer = useSelector(getCustomer);
  const customer = preferedCustomer || selectedCustomer;

  if (!finalForm) {
    return (
      <FormContainer submitting={submitting} className="size-xl">
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
            );

            // Use custom validator if provided, otherwise use required validator
            const validateFn = params.validate
              ? params.validate
              : option.required
                ? required
                : undefined;

            return (
              <OptionField
                key={key}
                label={option.label}
                name={`attributes.${key}`}
                tooltip={!params.hideHelp && option.help_text}
                tooltipEnd
                required={option.required}
                validate={validateFn}
                {...params}
              />
            );
          })}
      </FormContainer>
    );
  }

  // Render fields for "react-final-form"
  return (
    options.order &&
    options.order.map((key) => {
      const option = options.options[key];
      if (!option) {
        return null;
      }
      const { OptionField, params } = getComponentAndParams(
        option,
        key,
        customer,
        true,
      );

      // Determine the validate function - use custom validator if provided, otherwise use required validator
      const validateFn = params.validate
        ? params.validate
        : option.required
          ? required
          : undefined;

      return (
        <FormGroup
          key={key}
          label={!params.hideLabel && option.label}
          help={option.help_text}
          helpEnd
          required={option.required}
        >
          <Field
            name={`attributes.${key}`}
            component={OptionField as any}
            validate={validateFn}
            {...params}
            {...(OptionField === AwesomeCheckboxField
              ? { label: option.label, help_text: option.help_text }
              : {})}
          />
          {!params.hideError && <FormFieldError name={`attributes.${key}`} />}
        </FormGroup>
      );
    })
  );
};
