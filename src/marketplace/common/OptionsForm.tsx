import { useSelector } from 'react-redux';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  TextField,
  StringField,
  SelectField,
  NumberField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { SelectMultiCheckboxGroup } from '@waldur/form/SelectMultiCheckboxGroup';
import { TimeSelectField } from '@waldur/form/TimeSelectField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { fetchInstanceOptions, fetchTenantOptions } from '@waldur/support/api';
import { getCustomer } from '@waldur/workspace/selectors';

export const OptionsForm = ({ options }) => {
  const customer = useSelector(getCustomer);
  return (
    <FormContainer submitting={false} className="size-xl">
      {options.order &&
        options.order.map((key) => {
          const option = options.options[key];
          if (!option) {
            return null;
          }
          let OptionField = StringField;
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
              params = { hideLabel: true };
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
                loadOptions: (query, prevOptions, currentPage) =>
                  fetchTenantOptions(
                    query,
                    prevOptions,
                    currentPage,
                    customer.uuid,
                  ),
                placeholder: translate('Select tenant...'),
              };
              break;
            case 'select_multiple_openstack_tenants':
              OptionField = AsyncSelectField;
              params = {
                loadOptions: (query, prevOptions, currentPage) =>
                  fetchTenantOptions(
                    query,
                    prevOptions,
                    currentPage,
                    customer.uuid,
                  ),
                placeholder: translate('Select tenants...'),
                isMulti: true,
              };
              break;
            case 'select_openstack_instance':
              OptionField = AsyncSelectField;
              params = {
                loadOptions: (query, prevOptions, currentPage) =>
                  fetchInstanceOptions(
                    query,
                    prevOptions,
                    currentPage,
                    customer.uuid,
                  ),
                placeholder: translate('Select instance...'),
              };
              break;
            case 'select_multiple_openstack_instances':
              OptionField = AsyncSelectField;
              params = {
                loadOptions: (query, prevOptions, currentPage) =>
                  fetchInstanceOptions(
                    query,
                    prevOptions,
                    currentPage,
                    customer.uuid,
                  ),
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
              required={option.required}
              validate={option.required ? required : undefined}
              {...params}
            />
          );
        })}
    </FormContainer>
  );
};
