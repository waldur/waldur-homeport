import { Field, reduxForm } from 'redux-form';

import {
  getInitialValues,
  syncFiltersToURL,
  useSyncInitialFiltersToURL,
} from '@waldur/core/filters';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@waldur/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CATEGORY_RESOURCES_ALL_FILTER_FORM_ID } from './constants';
import { OfferingFilter } from './OfferingFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';
import { RuntimeStateFilter } from './RuntimeStateFilter';
import { OfferingChoice } from './types';

interface FormData {
  offering: OfferingChoice;
  organization;
  project;
  state;
}

const PureProjectResourcesFilter = ({ category_uuid, initialValues }) => {
  useSyncInitialFiltersToURL(initialValues);
  return (
    <>
      <TableFilterItem
        title={translate('Organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingFilter category_uuid={category_uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
          name="parent_offering"
          offeringFilter={parentOfferingFilter}
        />
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
        instantApply={false}
      >
        <ResourceStateFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="include_terminated"
          component={AwesomeCheckboxField}
          label={translate('Include terminated')}
        />
      </TableFilterItem>
    </>
  );
};

export const AllResourcesFilter = reduxForm<FormData, { category_uuid }>({
  form: CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  onChange: syncFiltersToURL,
  destroyOnUnmount: false,
  initialValues: getInitialValues(),
})(PureProjectResourcesFilter);
