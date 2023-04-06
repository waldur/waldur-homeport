import { FunctionComponent } from 'react';
import { Badge } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CategoryFilter } from './CategoryFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

const PureSupportResourcesFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      customValueComponent={({ value }) => (
        <Badge bg="secondary" className="text-dark">
          {value?.name}
        </Badge>
      )}
    >
      <OfferingAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Client organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete />
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
  </>
);

const enhance = reduxForm({
  form: 'SupportResourcesFilter',
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: getStates()[1],
  }),
  destroyOnUnmount: false,
});

export const SupportResourcesFilter = enhance(PureSupportResourcesFilter);
