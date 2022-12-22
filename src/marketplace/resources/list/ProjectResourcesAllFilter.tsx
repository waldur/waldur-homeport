import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CategoryFilter } from './CategoryFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

const PureProjectResourcesAllFilter: FunctionComponent<{}> = () => (
  <TableFilterFormContainer form={PROJECT_RESOURCES_ALL_FILTER_FORM_ID}>
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
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
    >
      <ResourceStateFilter />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
  initialValues: {
    state: getStates()[1],
  },
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
