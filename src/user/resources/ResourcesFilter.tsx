import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { CategoryFilter } from '@waldur/marketplace/resources/list/CategoryFilter';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { ResourceStateFilter } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { RuntimeStateFilter } from '@waldur/marketplace/resources/list/RuntimeStateFilter';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/SupportResourcesFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { USER_RESOURCES_FILTER_FORM_ID } from '../constants';

const organizationSelector = (state) =>
  getFormValues(USER_RESOURCES_FILTER_FORM_ID)(state)['organization'];

const PureProjectResourcesAllFilter: FunctionComponent<{}> = () => {
  const organizationValue = useSelector(organizationSelector);

  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Category')}
        name="category"
        badgeValue={(value) => value?.title}
      >
        <CategoryFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter customer_uuid={organizationValue?.uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Runtime state')}
        name="runtime_state"
        badgeValue={(value) => value?.label}
      >
        <RuntimeStateFilter />
      </TableFilterItem>
      <TableFilterItem title={translate('State')} name="state">
        <ResourceStateFilter reactSelectProps={{ isMulti: true }} />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: USER_RESOURCES_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
