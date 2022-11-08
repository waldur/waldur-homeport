import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { OfferingFilter } from './OfferingFilter';
import { OfferingChoice } from './types';

interface OwnProps {
  offerings: OfferingChoice[];
}

interface FormData {
  offering: OfferingChoice;
}

const PureProjectResourcesFilter = ({ offerings }) => (
  <TableFilterFormContainer form="ProjectResourcesFilter">
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingFilter options={offerings} />
    </TableFilterItem>
  </TableFilterFormContainer>
);

export const ProjectResourcesFilter = reduxForm<FormData, OwnProps>({
  form: 'ProjectResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues(),
  destroyOnUnmount: false,
})(PureProjectResourcesFilter);
