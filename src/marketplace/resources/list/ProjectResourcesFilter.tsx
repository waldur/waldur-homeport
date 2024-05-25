import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { OfferingFilter } from './OfferingFilter';
import { ProjectFilter } from './ProjectFilter';
import { RelatedCustomerFilter } from './RelatedCustomerFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { NON_TERMINATED_STATES } from './SupportResourcesFilter';
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
        <RelatedCustomerFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingFilter category_uuid={category_uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter customer_uuid={customer?.uuid} />
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

export const ProjectResourcesFilter = reduxForm<FormData, { category_uuid }>({
  form: 'ProjectResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
