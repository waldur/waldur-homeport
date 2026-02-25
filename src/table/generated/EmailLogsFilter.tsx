// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { EmailLogsListData } from 'waldur-js-client';

import { StringField } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureSupportEmailLogsFilter: FunctionComponent<{}> = () => (
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

export const SupportEmailLogsFilterFormId = 'SupportEmailLogsFilter';

interface SupportEmailLogsFilterFormData {
  emails: string;
  subject: string;
  sent_at: string;
}

export const SupportEmailLogsFilter = reduxForm<
  SupportEmailLogsFilterFormData,
  {}
>({
  form: SupportEmailLogsFilterFormId,
  destroyOnUnmount: false,
})(PureSupportEmailLogsFilter);

export const selectSupportEmailLogsFilter = createSelector<
  RootState,
  Partial<SupportEmailLogsFilterFormData>,
  EmailLogsListData['query']
>(getFormValues(SupportEmailLogsFilterFormId), (values) => {
  const filter: EmailLogsListData['query'] = {} as any;
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
});
