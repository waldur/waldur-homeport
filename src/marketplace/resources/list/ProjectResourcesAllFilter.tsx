import { FunctionComponent, useMemo } from 'react';
import { Field, useFormState } from 'react-final-form';
import { MarketplacePublicOfferingsListData, Project } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';
import { Customer } from '@/workspace/types';

import { CategoryFilter } from './CategoryFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';

interface ProjectResourcesAllFilterProps {
  hasProjectFilter?: boolean;
  hasCustomerFilter?: boolean;
  customer?: Customer;
  project?: Project;
}

export const ProjectResourcesAllFilter: FunctionComponent<
  ProjectResourcesAllFilterProps
> = (props) => {
  const { values: formValues } = useFormState();

  const offeringFilter = useMemo(
    (): MarketplacePublicOfferingsListData['query'] => ({
      project_uuid: props.project?.uuid,
      allowed_customer_uuid: props.customer?.uuid,
      resource_customer_uuid:
        formValues?.organization?.uuid || props.customer?.uuid,
      resource_project_uuid: formValues?.project?.uuid || props.project?.uuid,
    }),
    [props.project, props.customer, formValues],
  );

  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          providerOfferings={false}
          reactSelectProps={{ variant: 'tableFilter' }}
          offeringFilter={offeringFilter}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          reactSelectProps={{ variant: 'tableFilter' }}
          offeringFilter={parentOfferingFilter}
          name="parent_offering"
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Category')}
        name="category"
        badgeValue={(value) => value?.title}
      >
        <CategoryFilter
          project={formValues?.project || props.project}
          customer={formValues?.organization || props.customer}
        />
      </TableFilterItem>
      {props.hasCustomerFilter ? (
        <TableFilterItem
          title={translate('Organization')}
          name="organization"
          badgeValue={(value) => value?.name}
        >
          <OrganizationAutocomplete
            reactSelectProps={{ variant: 'tableFilter' }}
          />
        </TableFilterItem>
      ) : null}
      {props.hasProjectFilter ? (
        <TableFilterItem
          title={translate('Project')}
          name="project"
          badgeValue={(value) => value?.name}
        >
          <ProjectFilter reactSelectProps={{ variant: 'tableFilter' }} />
        </TableFilterItem>
      ) : null}
      <TableFilterItem
        title={translate('Runtime state')}
        name="runtime_state"
        badgeValue={(value) => value?.label}
      >
        <RuntimeStateFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <ResourceStateFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="include_terminated"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Include terminated')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Paused')}
        name="paused"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="paused"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Paused')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Downscaled')}
        name="downscaled"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="downscaled"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Downscaled')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Restrict member access')}
        name="restrict_member_access"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="restrict_member_access"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Restrict member access')}
        />
      </TableFilterItem>
    </>
  );
};
