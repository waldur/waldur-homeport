import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { MarketplacePublicOfferingsListData, Project } from 'waldur-js-client';

import {
  getInitialValues,
  syncFiltersToURL,
  useSyncInitialFiltersToURL,
} from '@waldur/core/filters';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@waldur/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { Customer } from '@waldur/workspace/types';

import { CategoryFilter } from './CategoryFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';

interface ProjectResourcesAllFilterProps {
  hasProjectFilter?: boolean;
  hasCustomerFilter?: boolean;
  customer?: Customer;
  project?: Project;
  change?: any;
  initialValues?: any;
}

const PureProjectResourcesAllFilter: FunctionComponent<
  ProjectResourcesAllFilterProps
> = (props) => {
  useSyncInitialFiltersToURL(props.initialValues);

  const formValues = useSelector(
    getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  ) as { project: Project; organization: Customer };

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
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
          offeringFilter={offeringFilter}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
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
            reactSelectProps={REACT_SELECT_TABLE_FILTER}
          />
        </TableFilterItem>
      ) : null}
      {props.hasProjectFilter ? (
        <TableFilterItem
          title={translate('Project')}
          name="project"
          badgeValue={(value) => value?.name}
        >
          <ProjectFilter reactSelectProps={REACT_SELECT_TABLE_FILTER} />
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
          component={AwesomeCheckboxField}
          label={translate('Include terminated')}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm<{}, ProjectResourcesAllFilterProps>({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues(),
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
