import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { OfferingFilter } from './OfferingFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { NON_TERMINATED_STATES } from './SupportResourcesFilter';
import { OfferingChoice } from './types';

interface OwnProps {
  offerings: OfferingChoice[];
}

interface FormData {
  offering: OfferingChoice;
}

const PureProjectResourcesFilter = ({ offerings }) => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingFilter options={offerings} />
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

export const ProjectResourcesFilter = reduxForm<FormData, OwnProps>({
  form: 'ProjectResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: NON_TERMINATED_STATES,
  }),
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
