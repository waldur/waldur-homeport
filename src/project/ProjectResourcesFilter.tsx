import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { CategoryFilter } from '@waldur/marketplace/resources/list/CategoryFilter';
import {
  getStates,
  ResourceStateFilter,
} from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { PROJECT_RESOURCES_FILTER_FORM_ID } from '@waldur/project/constants';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProjectResourcesFilter: FunctionComponent = () => (
  <TableFilterFormContainer form={PROJECT_RESOURCES_FILTER_FORM_ID}>
    <TableFilterItem title={translate('Category')} name="category">
      <CategoryFilter />
    </TableFilterItem>
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value.label}
    >
      <ResourceStateFilter />
    </TableFilterItem>
  </TableFilterFormContainer>
);

export const ProjectResourcesFilter = reduxForm({
  form: PROJECT_RESOURCES_FILTER_FORM_ID,
  initialValues: {
    state: getStates()[1],
  },
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
