import { FunctionComponent } from 'react';
import { UserAgreement, userAgreementsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { UserAgreementCreateButton } from './UserAgreementCreateButton';
import { UserAgreementDeleteButton } from './UserAgreementDeleteButton';
import { UserAgreementsEditButton } from './UserAgreementsEditButton';
import { UserAgreementsExpandableRow } from './UserAgreementsExpandableRow';

const agreementTypeLabels = {
  PP: translate('Privacy policy'),
  TOS: translate('Terms of service'),
};

const getLanguageLabel = (code: string) => {
  if (!code) return translate('Default');
  const lang = ENV.languageChoices.find((l) => l.code === code);
  return lang?.label || code;
};

const UserAggrementsRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[UserAgreementsEditButton, UserAgreementDeleteButton].filter(
      Boolean,
    )}
  />
);

export const UserAgreementsList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'user-agreements',
    fetchData: createFetcher(userAgreementsList),
  });
  return (
    <Table<UserAgreement>
      {...props}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }) =>
            agreementTypeLabels[row.agreement_type] || row.agreement_type,
        },
        {
          title: translate('Language'),
          render: ({ row }) => getLanguageLabel(row.language),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
        },
      ]}
      verboseName={translate('user agreements')}
      rowActions={UserAggrementsRowActions}
      expandableRow={UserAgreementsExpandableRow}
      tableActions={<UserAgreementCreateButton refetch={props.fetch} />}
    />
  );
};
