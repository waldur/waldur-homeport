import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const PureFlowFilter: FunctionComponent = () => (
  <TableFilterFormContainer form="FlowListFilter">
    <TableFilterItem title={translate('State')} name="state">
      <RequestStateFilter />
    </TableFilterItem>
  </TableFilterFormContainer>
);

const enhance = reduxForm({
  form: 'FlowListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
  destroyOnUnmount: false,
});

export const FlowListFilter = enhance(PureFlowFilter);
