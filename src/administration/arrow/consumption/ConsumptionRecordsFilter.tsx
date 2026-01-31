import { reduxForm, Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ARROW_FORM_NAMES } from '../constants';

const FINALIZED_OPTIONS = [
  { value: true, label: translate('Finalized') },
  { value: false, label: translate('Pending') },
];

const PureConsumptionRecordsFilter = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Status')}
      name="is_finalized"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="is_finalized"
        component={(props) => (
          <Select
            {...props.input}
            options={FINALIZED_OPTIONS}
            isClearable
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: ARROW_FORM_NAMES.consumptionRecordsFilter,
  destroyOnUnmount: false,
});

export const ConsumptionRecordsFilter = enhance(PureConsumptionRecordsFilter);
