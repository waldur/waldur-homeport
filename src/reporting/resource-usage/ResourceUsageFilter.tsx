import { FunctionComponent } from 'react';
import { Field, useFormState } from 'react-final-form';

import { AccountingPeriodFieldComponent } from '@/customer/list/AccountingPeriodField';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { makeLastTwelveMonthsFilterPeriods } from '@/form/utils';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { ResourceAutocomplete } from '@/resource/ResourceAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';

export const FORM_ID = 'ResourceUsageFilter';

const options = makeLastTwelveMonthsFilterPeriods();

export const ResourceUsageFilter: FunctionComponent = () => {
  const { values } = useFormState();
  const customer = values?.organization;

  return (
    <>
      <TableFilterItem
        title={translate('Accounting period')}
        name="accounting_period"
        badgeValue={(value) => value?.label}
        ellipsis={false}
      >
        <Field
          name="accounting_period"
          component={AccountingPeriodFieldComponent}
          options={options}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter
          customer_uuid={customer ? customer.uuid : null}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) =>
          value?.category_title
            ? `${value.category_title} / ${value.name}`
            : value?.name
        }
      >
        <OfferingAutocomplete
          offeringFilter={{ shared: true }}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>

      <TableFilterItem
        title={translate('Resource')}
        name="resource"
        badgeValue={(value) => value?.name}
      >
        <ResourceAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
    </>
  );
};
