import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const PureFlowFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <RequestStateFilter />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'FlowListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
  destroyOnUnmount: false,
});

export const FlowListFilter = enhance(PureFlowFilter);
