import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { getCallStateOptions } from '../utils';

import { CallStateFilter } from './CallStateFilter';

const PureCallAllFilters: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <CallStateFilter />
    </TableFilterItem>
  </>
);

const enhanceWithDefault = reduxForm({
  form: CALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
  initialValues: {
    state: [getCallStateOptions()[1]],
  },
});

export const CallAllFiltersWithDefaultState =
  enhanceWithDefault(PureCallAllFilters);

const enhance = reduxForm({
  form: CALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const CallAllFilters = enhance(PureCallAllFilters);
