import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  CallStateFilter,
  getStates,
} from '@waldur/proposals/call-management/CallStateFilter';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureCallAllFilters: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <CallStateFilter />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: CALL_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[1]],
  },
  destroyOnUnmount: false,
});

export const CallAllFilters = enhance(PureCallAllFilters);
