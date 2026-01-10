import { Field, reduxForm } from 'redux-form';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const REVIEWER_POOL_FILTER_FORM_ID = 'ReviewerPoolFilter';

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: translate('Pending') },
  { value: 'accepted', label: translate('Accepted') },
  { value: 'declined', label: translate('Declined') },
  { value: 'expired', label: translate('Expired') },
];

const PureReviewerPoolFilter = () => (
  <TableFilterItem title={translate('Status')} name="invitation_status">
    <Field
      name="invitation_status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('All statuses')}
          options={INVITATION_STATUS_OPTIONS}
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
  form: REVIEWER_POOL_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ReviewerPoolFilter = enhance(PureReviewerPoolFilter);
