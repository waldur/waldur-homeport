import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { NON_TERMINATED_STATES } from './SupportResourcesFilter';

const PureProjectResourcesAllFilter: FunctionComponent<{}> = () => (
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

const enhance = reduxForm({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
