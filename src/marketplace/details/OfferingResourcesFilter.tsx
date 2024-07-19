import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FILTER_OFFERING_RESOURCE } from '@waldur/marketplace/details/constants';
import { ResourceStateFilter } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureOfferingResourcesFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state" ellipsis={false}>
      <ResourceStateFilter reactSelectProps={{ isMulti: true }} />
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
