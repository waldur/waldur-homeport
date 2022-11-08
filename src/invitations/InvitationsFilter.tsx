import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterFormContainer } from '@waldur/table/TableFilterFormContainer';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  {
    label: translate('Requested'),
    value: 'requested',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
];

const PureInvitationsFilter = () => {
  return (
    <TableFilterFormContainer form="InvitationsFilter">
      <TableFilterItem title={translate('State')} name="state">
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={choices}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isMulti={true}
              isClearable={true}
            />
          )}
        />
      </TableFilterItem>
    </TableFilterFormContainer>
  );
};

const enhance = reduxForm({
  form: 'InvitationsFilter',
  initialValues: {
    state: [choices[2]],
  },
  destroyOnUnmount: false,
});

export const InvitationsFilter = enhance(PureInvitationsFilter);
