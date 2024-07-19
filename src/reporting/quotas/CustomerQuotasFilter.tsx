import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { SelectField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getQuotas } from './constants';
import { QuotaChoice } from './types';

export const PureCustomerQuotasFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Quota')}
    name="quota"
    badgeValue={(value) => value?.title}
    ellipsis={false}
    hideRemoveButton
  >
    <Field
      name="quota"
      options={getQuotas(true)}
      isClearable={false}
      component={SelectField}
      getOptionValue={(option: QuotaChoice) => option.key}
      getOptionLabel={(option: QuotaChoice) => option.title}
      placeholder={translate('Select quota') + '...'}
      noUpdateOnBlur
      {...REACT_SELECT_TABLE_FILTER}
    />
  </TableFilterItem>
);

export const CustomerQuotasFilter = reduxForm<{}, {}>({
  form: 'CustomerQuotasFilter',
  destroyOnUnmount: false,
  initialValues: {
    quota: getQuotas(true)[0],
  },
})(PureCustomerQuotasFilter);
