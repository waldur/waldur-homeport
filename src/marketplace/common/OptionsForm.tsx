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

import { ConditionalCascadeField } from './ConditionalCascadeField';
import { fetchOpenstackOptions } from './fetchOpenstackOptions';
import { DeployFormData } from './types';

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

            return (
              <OptionField
                key={key}
                label={option.label}
                name={`attributes.${key}`}
                tooltip={option.help_text}
                tooltipEnd
                required={option.required}
                validate={option.required ? required : undefined}
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

      return (
        <FormGroup
          label={!params.hideLabel && option.label}
          help={option.help_text}
          helpEnd
          required={option.required}
        >
          <Field
            key={key}
            name={`attributes.${key}`}
            component={OptionField as any}
            validate={option.required ? required : undefined}
            {...params}
            {...(OptionField === AwesomeCheckboxField
              ? { label: option.label, help_text: option.help_text }
              : {})}
          />
          <FormFieldError name={`attributes.${key}`} />
        </FormGroup>
      );
    })
  );
};
