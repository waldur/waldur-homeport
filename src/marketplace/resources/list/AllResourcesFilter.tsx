import { useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { syncFiltersToURL } from '@waldur/core/filters';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { OfferingFilter } from './OfferingFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { OfferingChoice } from './types';

interface FormData {
  offering: OfferingChoice;
  organization;
  project;
  state;
}

const PureProjectResourcesFilter = ({ category_uuid }) => {
  const customer = useSelector(getCustomer);

  return (
    <>
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
        <ProjectFilter customer_uuid={customer?.uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingFilter category_uuid={category_uuid} />
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
      <TableFilterItem
        title={translate('Include terminated')}
        name="include_terminated"
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

export const AllResourcesFilter = reduxForm<FormData, { category_uuid }>({
  form: 'AllResourcesFilter',
  onChange: syncFiltersToURL,
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
