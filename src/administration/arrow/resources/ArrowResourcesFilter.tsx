import { useSelector } from 'react-redux';
import { reduxForm, getFormValues } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ARROW_FORM_NAMES } from '../constants';

const PureArrowResourcesFilter = () => {
  const formValues = useSelector(
    getFormValues(ARROW_FORM_NAMES.arrowResourcesFilter),
  ) as { organization?: { uuid: string } } | undefined;

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
        <ProjectFilter
          customer_uuid={formValues?.organization?.uuid}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: ARROW_FORM_NAMES.arrowResourcesFilter,
  destroyOnUnmount: false,
});

export const ArrowResourcesFilter = enhance(PureArrowResourcesFilter);
