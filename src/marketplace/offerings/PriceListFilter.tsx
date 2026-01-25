import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PurePriceListFilter: FunctionComponent = () => (
  <TableFilterItem
    title={translate('Offering')}
    name="offering"
    getValueLabel={(option) => `${option.category_title} / ${option.name}`}
  >
    <OfferingAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
  </TableFilterItem>
);

const enhance = reduxForm({ form: 'PriceListFilter', destroyOnUnmount: false });

export const PriceListFilter = enhance(PurePriceListFilter);
