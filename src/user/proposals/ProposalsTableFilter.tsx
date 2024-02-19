import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

const choices = [
  {
    label: translate('Active'),
    value: 'Active',
  },
  {
    label: translate('Draft'),
    value: 'Draft',
  },
  {
    label: translate('Archived'),
    value: 'Archived',
  },
];

const PureProposalsTableFilter: FunctionComponent<{}> = () => (
  <>
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
  </>
);

const enhance = reduxForm({
  form: USER_PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProposalsTableFilter = enhance(PureProposalsTableFilter);
