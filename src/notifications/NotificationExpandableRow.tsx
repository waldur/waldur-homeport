import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatRole } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { IdNamePair, NotificationResponseData } from './types';

const OptionsList = ({ label, list }: { label: string; list: IdNamePair[] }) =>
  list ? (
    <p>
      <b>{label}: </b>
      {list.map((c) => c.name || c).join(', ')}
    </p>
  ) : null;

const RolesList = ({ label, list }) => (
  <OptionsList label={label} list={list?.map(formatRole)} />
);

export const NotificationExpandableRow: FunctionComponent<{
  row: NotificationResponseData;
}> = ({ row }) => (
  <>
    <p>
      <b>{translate('Message')}: </b>
      {row.body}
    </p>
    <p>
      <b>{translate('Recipients')}: </b>
      {row.emails.join(', ')}
    </p>
    <OptionsList
      label={translate('Organizations')}
      list={row.query.customers}
    />
    <RolesList
      label={translate('Organization roles')}
      list={row.query.customer_roles}
    />
    <OptionsList label={translate('Projects')} list={row.query.projects} />
    <RolesList
      label={translate('Project roles')}
      list={row.query.project_roles}
    />
    <OptionsList label={translate('Offerings')} list={row.query.offerings} />
    {row.send_at && (
      <p>
        <b>{translate('Send at')}: </b>
        {formatDateTime(row.send_at)}
      </p>
    )}
  </>
);
