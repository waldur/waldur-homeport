import { FC } from 'react';
import { useSelector } from 'react-redux';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
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

import { Offering } from '../types';

import { fetchOpenstackOptions } from './fetchOpenstackOptions';
import { DeployFormData } from './types';

interface OptionsFormProps {
  options: Offering['options'];
  submitting?: boolean;
  customer?: DeployFormData['customer'];
}

export const OptionsForm = ({
  options,
  submitting,
  customer: preferedCustomer,
}: OptionsFormProps) => {
  const selectedCustomer = useSelector(getCustomer);
  const customer = preferedCustomer || selectedCustomer;

  return (
    <FormContainer submitting={submitting} className="size-xl">
      {options.order &&
        options.order.map((key) => {
          const option = options.options[key];
          if (!option) {
            return null;
          }
          let OptionField: FC<Partial<FormGroupProps>> = StringField;
          let params = {};
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
              OptionField = AsyncSelectField;
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
              OptionField = AsyncSelectField;
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
              OptionField = AsyncSelectField;
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
              OptionField = AsyncSelectField;
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
          }
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
};
