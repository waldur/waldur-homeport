import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CategoryFilter } from './CategoryFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { ShowTerminatedAndErredFilter } from './ShowTerminatedAndErredFilter';

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
    <TableFilterItem
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
    >
      <ShowTerminatedAndErredFilter />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
