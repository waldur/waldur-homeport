// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  CustomersListData,
  OrganizationGroup,
  organizationGroupsList,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const AccountingIsRunningOptions: AccountingIsRunningOption[] = [
  {
    label: translate('Not running accounting'),
    value: false,
  },
  {
    label: translate('Running accounting'),
    value: true,
  },
  {
    label: translate('All'),
    value: 'undefined',
  },
];
export interface AccountingIsRunningOption {
  label: string;
  value: any;
}

export const CustomersFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Accounting is running')}
      name="accounting_is_running"
      getValueLabel={(value: AccountingIsRunningOption) => value?.label}
    >
      <Field
        name="accounting_is_running"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Show with running accounting')}
            options={AccountingIsRunningOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AccountingIsRunningOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AccountingIsRunningOption) => option.label}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Service provider')}
      name="is_service_provider"
      badgeValue={(value) =>
        value ? translate('Service provider') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="is_service_provider"
        component={AwesomeCheckboxField}
        label={translate('Service provider')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    {isFeatureVisible(
      MarketplaceFeatures.show_call_management_functionality,
    ) && (
      <TableFilterItem
        title={translate('Call managing organization')}
        name="is_call_managing_organization"
        badgeValue={(value) =>
          value ? translate('Call managing organization') : translate('All')
        }
        ellipsis={false}
      >
        <Field
          name="is_call_managing_organization"
          component={AwesomeCheckboxField}
          label={translate('Call managing organization')}
          parse={(v) => v || undefined}
        />
      </TableFilterItem>
    )}
    <TableFilterItem
      title={translate('Organization group')}
      name="organization_group"
      getValueLabel={(value: OrganizationGroup) => value?.name}
    >
      <Field
        name="organization_group"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Organization group')}
            loadOptions={createLoadOptions(organizationGroupsList, 'name')}
            defaultOptions
            getOptionValue={(option: OrganizationGroup) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: OrganizationGroup) =>
              String(option.name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            isMulti={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const CustomersFilterFormId = 'CustomersFilter';

export interface CustomersFilterFormData {
  accounting_is_running: AccountingIsRunningOption;
  is_service_provider: boolean;
  is_call_managing_organization: boolean;
  organization_group: OrganizationGroup[];
}

type CustomersFilterQuery = CustomersListData['query'];

export const selectCustomersFilter = (
  values?: Partial<CustomersFilterFormData>,
): CustomersFilterQuery => {
  const filter: CustomersFilterQuery = {} as any;
  if (values) {
    if (values.accounting_is_running) {
      filter.accounting_is_running = values.accounting_is_running.value;
    }
    if (values.is_service_provider) {
      filter.is_service_provider = values.is_service_provider;
    }
    if (values.is_call_managing_organization) {
      filter.is_call_managing_organization =
        values.is_call_managing_organization;
    }
    if (values.organization_group) {
      filter.organization_group_uuid = values.organization_group.map(
        (v: any) => v.uuid,
      );
    }
  }
  return filter;
};
