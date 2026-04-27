import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { Checklist, checklistsAdminList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { required } from '@/core/validators';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const Step1SelectChecklist: FC<WizardFormStepProps> = (props) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['checklistsAdminOffering'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            checklist_type: 'offering_compliance',
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const tableProps = useTable({
    table: 'OfferingChecklistSelectorTable',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.name || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter((row) => row.name.toLowerCase().includes(q));
      }
      return Promise.resolve({ rows });
    },
    queryField: 'name',
  });

  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  return (
    <WizardForm {...props} submitDisabled={isLoading} submitDisabledInvalid>
      {!isLoading && error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <Table<Checklist>
          {...tableProps}
          columns={[
            {
              title: translate('Checklist'),
              render: ({ row }) => row.name,
            },
            {
              title: translate('Questions'),
              render: ({ row }) => row.questions_count,
            },
          ]}
          verboseName={translate('Checklists')}
          hasQuery
          hideTitle
          hideRefresh
          headerClassName="px-0"
          cardBordered={false}
          fullWidth
          className="mt-n5 border-bottom"
          minHeight="auto"
          hoverable
          fieldType="radio"
          fieldName="checklist"
          validate={[required]}
          loading={isLoading}
        />
      )}
    </WizardForm>
  );
};
