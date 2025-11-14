import { FC } from 'react';
import {
  OnboardingCountryChecklistConfiguration,
  onboardingCountryConfigsList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OnboardingCountryConfigActions } from './OnboardingCountryConfigActions';
import { OnboardingCountryConfigCreateButton } from './OnboardingCountryConfigCreateButton';

export const OnboardingCountryChecklistConfigs: FC = () => {
  const tableProps = useTable({
    table: 'OnboardingCountryChecklistConfigs',
    fetchData: createFetcher(onboardingCountryConfigsList),
    queryField: 'country',
  });

  return (
    <Table<OnboardingCountryChecklistConfiguration>
      {...tableProps}
      columns={[
        {
          title: translate('Country'),
          render: ({ row }) => row.country,
        },
        {
          title: translate('Checklist name'),
          render: ({ row }) => renderFieldOrDash(row.checklist_name),
        },
        {
          title: translate('Checklist UUID'),
          render: ({ row }) => (
            <code className="text-muted small">{row.checklist_uuid}</code>
          ),
          copyField: (row) => row.checklist_uuid,
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
      ]}
      verboseName={translate('Country checklist configurations')}
      hasQuery
      showPageSizeSelector
      tableActions={
        <OnboardingCountryConfigCreateButton refetch={tableProps.fetch} />
      }
      rowActions={OnboardingCountryConfigActions}
    />
  );
};
