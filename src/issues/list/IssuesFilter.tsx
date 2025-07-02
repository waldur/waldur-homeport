import { Field, reduxForm } from 'redux-form';

import {
  getInitialValues,
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const getIssueStatuses = () => [
  { value: 'Open', label: translate('Open') },
  { value: 'Waiting for support', label: translate('Waiting for support') },
  { value: 'Closed', label: translate('Closed') },
  { value: 'Resolved', label: translate('Resolved') },
];

const PureIssuesFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);

  return (
    <TableFilterItem
      title={translate('Status')}
      name="status"
      instantApply={false}
    >
      <Field
        name="status"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select status...')}
            options={getIssueStatuses()}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_MULTI_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  );
};

const enhance = reduxForm({
  form: 'IssuesFilter',
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
  initialValues: getInitialValues(),
});

export const IssuesFilter = enhance(PureIssuesFilter);
