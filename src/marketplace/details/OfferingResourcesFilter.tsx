import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FILTER_OFFERING_RESOURCE } from '@waldur/marketplace/details/constants';
import { ResourceStateFilter } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { NON_TERMINATED_STATES } from '../resources/list/SupportResourcesFilter';

const PureOfferingResourcesFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state" ellipsis={false}>
      <ResourceStateFilter reactSelectProps={{ isMulti: true }} />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: FILTER_OFFERING_RESOURCE,
  initialValues: { state: NON_TERMINATED_STATES },
  destroyOnUnmount: false,
});

export const OfferingResourcesFilter = enhance(PureOfferingResourcesFilter);
