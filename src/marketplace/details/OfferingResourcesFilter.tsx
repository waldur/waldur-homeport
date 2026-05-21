import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { ResourceStateFilter } from '@/marketplace/resources/list/ResourceStateFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

export const OfferingResourcesFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      ellipsis={false}
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
        type="checkbox"
        component={AwesomeCheckboxField}
        label={translate('Include terminated')}
      />
    </TableFilterItem>
  </>
);
