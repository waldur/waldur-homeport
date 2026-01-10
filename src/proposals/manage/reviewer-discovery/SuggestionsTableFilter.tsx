import { Field, reduxForm } from 'redux-form';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const SUGGESTIONS_FILTER_FORM_ID = 'SuggestionsTableFilter';

const SUGGESTION_STATUS_OPTIONS = [
  { value: 'pending', label: translate('Pending') },
  { value: 'confirmed', label: translate('Confirmed') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'invited', label: translate('Invited') },
];

export const getSuggestionStatusOptions = () => SUGGESTION_STATUS_OPTIONS;

const PureSuggestionsTableFilter = () => (
  <TableFilterItem title={translate('Status')} name="status">
    <Field
      name="status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('All statuses')}
          options={SUGGESTION_STATUS_OPTIONS}
          value={fieldProps.input.value}
          onChange={fieldProps.input.onChange}
          isClearable
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: SUGGESTIONS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const SuggestionsTableFilter = enhance(PureSuggestionsTableFilter);
