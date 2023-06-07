import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { OfferingFilter } from './OfferingFilter';
import { ShowTerminatedAndErredFilter } from './ShowTerminatedAndErredFilter';
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
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
    >
      <ShowTerminatedAndErredFilter />
    </TableFilterItem>
  </>
);

export const ProjectResourcesFilter = reduxForm<FormData, OwnProps>({
  form: 'ProjectResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues(),
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
