import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FILTER_OFFERING_RESOURCE } from '@/marketplace/details/constants';
import { ResourceStateFilter } from '@/marketplace/resources/list/ResourceStateFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureOfferingResourcesFilter: FunctionComponent = () => (
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
        component={AwesomeCheckboxField}
        label={translate('Include terminated')}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: FILTER_OFFERING_RESOURCE,
  destroyOnUnmount: false,
});

export const OfferingResourcesFilter = enhance(PureOfferingResourcesFilter);
