import { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { NON_TERMINATED_STATES } from './SupportResourcesFilter';

const PureProjectResourcesAllFilter: FunctionComponent<any> = (props) => {
  const customer = useSelector(getCustomer);
  useEffect(() => {
    props.change('project', undefined);
  }, [customer]);

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

const enhance = reduxForm({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
