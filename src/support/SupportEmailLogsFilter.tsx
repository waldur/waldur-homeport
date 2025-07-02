import { Field, reduxForm } from 'redux-form';

import { StringField } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureSupportEmailLogsFilter = () => (
  <>
    <TableFilterItem
      title={translate('Subject')}
      name="subject"
      instantApply={false}
    >
      <Field
        name="subject"
        component={StringField}
        placeholder={translate('Subject contains')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Emails')}
      name="emails"
      instantApply={false}
    >
      <Field
        name="emails"
        component={StringField}
        placeholder={translate('Emails contains')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Sent at')}
      name="sent_at"
      instantApply={false}
    >
      <Field
        name="sent_at"
        component={DateField}
        placeholder="YYYY-MM-DD"
        inline
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'SupportEmailLogsFilter',
  destroyOnUnmount: false,
});

export const SupportEmailLogsFilter = enhance(PureSupportEmailLogsFilter);
