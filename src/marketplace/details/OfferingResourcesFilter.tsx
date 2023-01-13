import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FILTER_OFFERING_RESOURCE } from '@waldur/marketplace/details/constants';
import {
  getStates,
  ResourceStateFilter,
} from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureOfferingResourcesFilter: FunctionComponent = () => (
  <TableFilterFormContainer form={FILTER_OFFERING_RESOURCE}>
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <ResourceStateFilter />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: FILTER_OFFERING_RESOURCE,
  initialValues: { state: getStates()[1] },
  destroyOnUnmount: false,
});

export const OfferingResourcesFilter = enhance(PureOfferingResourcesFilter);
