import { Field, reduxForm } from 'redux-form';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const MY_INVITATIONS_FILTER_FORM_ID = 'MyInvitationsFilter';

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: translate('Pending') },
  { value: 'accepted', label: translate('Accepted') },
  { value: 'declined', label: translate('Declined') },
  { value: 'expired', label: translate('Expired') },
];

const PureMyInvitationsFilter = () => (
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
  form: MY_INVITATIONS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  initialValues: {
    invitation_status: { value: 'pending', label: translate('Pending') },
  },
});

export const MyInvitationsFilter = enhance(PureMyInvitationsFilter);
