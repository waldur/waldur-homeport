// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { EmailLogsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { StringFilter, DateFilter } from '@/table';

export const EmailLogsFilter: FunctionComponent<{}> = () => (
  <>
    <StringFilter
      title={translate('Emails')}
      name="emails"
      placeholder={translate('Emails contains')}
    />
    <StringFilter
      title={translate('Subject')}
      name="subject"
      placeholder={translate('Subject contains')}
    />
    <DateFilter
      title={translate('Sent at')}
      name="sent_at"
      placeholder={translate('YYYY-MM-DD')}
    />
  </>
);

export const EmailLogsFilterFormId = 'EmailLogsFilter';

export interface EmailLogsFilterFormData {
  emails: string;
  subject: string;
  sent_at: string;
}

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
