import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const Filter = () => (
  <TableFilterItem title={translate('State')} name="state">
    <RequestStateFilter />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: 'ProjectUpdateRequestListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
});

export const ProjectUpdateRequestListFilter = enhance(Filter);
