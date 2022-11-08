import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { OfferingStateFilter, getStates } from './OfferingStateFilter';

const PureOfferingsFilter: FunctionComponent = () => (
  <TableFilterFormContainer form={PUBLIC_OFFERINGS_FILTER_FORM_ID}>
    <TableFilterItem title={translate('State')} name="state">
      <OfferingStateFilter />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: PUBLIC_OFFERINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
  destroyOnUnmount: false,
});

export const OfferingsFilter = enhance(PureOfferingsFilter);
