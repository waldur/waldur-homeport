// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { EmailLogsListData } from 'waldur-js-client';

import { StringField } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureEmailLogsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('Emails')} name="emails">
      <Field
        name="emails"
        component={StringField}
        placeholder={translate('Emails contains')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Subject')} name="subject">
      <Field
        name="subject"
        component={StringField}
        placeholder={translate('Subject contains')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Sent at')} name="sent_at">
      <Field
        name="sent_at"
        component={DateField}
        placeholder={translate('YYYY-MM-DD')}
      />
    </TableFilterItem>
  </>
);

export const EmailLogsFilterFormId = 'EmailLogsFilter';

export interface EmailLogsFilterFormData {
  emails: string;
  subject: string;
  sent_at: string;
}

export const EmailLogsFilter = PureEmailLogsFilter;

type EmailLogsFilterQuery = EmailLogsListData['query'];

export const selectEmailLogsFilter = (
  values?: Partial<EmailLogsFilterFormData>,
): EmailLogsFilterQuery => {
  const filter: EmailLogsFilterQuery = {} as any;
  if (values) {
    if (values.emails) {
      filter.emails = values.emails;
    }
    if (values.subject) {
      filter.subject = values.subject;
    }
    if (values.sent_at) {
      filter.sent_at = values.sent_at;
    }
  }
  return filter;
};
