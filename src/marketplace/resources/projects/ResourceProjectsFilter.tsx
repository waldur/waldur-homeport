import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const RESOURCE_PROJECTS_FILTER_FORM_ID = 'resource-projects-filter';

interface FormData {
  include_removed?: boolean;
}

const PureResourceProjectsFilter = () => (
  <TableFilterItem
    title={translate('Show removed')}
    name="include_removed"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
  >
    <Field
      name="include_removed"
      component={AwesomeCheckboxField}
      label={translate('Show removed')}
    />
  </TableFilterItem>
);

export const ResourceProjectsFilter = reduxForm<FormData>({
  form: RESOURCE_PROJECTS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  initialValues: { include_removed: false },
})(PureResourceProjectsFilter);
