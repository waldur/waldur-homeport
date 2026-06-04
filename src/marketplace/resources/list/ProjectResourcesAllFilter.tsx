import { FunctionComponent, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { MarketplacePublicOfferingsListData, Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { BooleanFilter } from '@/table';
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
      <OfferingFilter
        providerOfferings={false}
        offeringFilter={offeringFilter}
      />
      <OfferingFilter
        title={translate('Parent offering')}
        name="parent_offering"
        offeringFilter={parentOfferingFilter}
      />
      <CategoryFilter
        project={formValues?.project || props.project}
        customer={formValues?.organization || props.customer}
      />
      {props.hasCustomerFilter ? <OrganizationFilter /> : null}
      {props.hasProjectFilter ? <ProjectFilter /> : null}
      <RuntimeStateFilter />
      <ResourceStateFilter instantApply={false} />
      <BooleanFilter
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        type="checkbox"
        label={translate('Include terminated')}
      />
      <BooleanFilter
        title={translate('Paused')}
        name="paused"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        type="checkbox"
        label={translate('Paused')}
      />
      <BooleanFilter
        title={translate('Downscaled')}
        name="downscaled"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        type="checkbox"
        label={translate('Downscaled')}
      />
      <BooleanFilter
        title={translate('Restrict member access')}
        name="restrict_member_access"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
        type="checkbox"
        label={translate('Restrict member access')}
      />
    </>
  );
};
