import { FC } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const RESOURCE_PROJECTS_FILTER_FORM_ID = 'resource-projects-filter';

export const ResourceProjectsFilter: FC = () => (
  <TableFilterItem
    title={translate('Show removed')}
    name="include_removed"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
  >
    <Field
      name="include_removed"
      type="checkbox"
      component={AwesomeCheckboxField}
      label={translate('Show removed')}
    />
  </TableFilterItem>
);
