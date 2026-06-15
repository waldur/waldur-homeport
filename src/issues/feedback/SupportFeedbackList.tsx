import { FC, useMemo } from 'react';
import { Feedback, supportFeedbacksList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { SUPPORT_FEEDBACK_LIST } from '@/issues/feedback/constants';
import { IssueField } from '@/issues/feedback/IssueField';
import { SupportFeedbackListExpandableRow } from '@/issues/feedback/SupportFeedbackListExpandableRow';
import { makeLastTwelveMonthsFilterPeriodsAsCreatedRange } from '@/issues/utils';
import { createFetcher } from '@/table/api';
import {
  selectSupportFeedbacksFilter,
  SupportFeedbacksFilter,
  SupportFeedbacksFilterFormId,
} from '@/table/generated/SupportFeedbacksFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { feedbackOptions } from './utils';

interface SupportFeedbackListProps {
  standalone?: boolean;
}

export const SupportFeedbackList: FC<SupportFeedbackListProps> = ({
  standalone = false,
}) => {
  const values = useFilterValues(SUPPORT_FEEDBACK_LIST);

  const filter = useMemo(() => selectSupportFeedbacksFilter(values), [values]);

  const props = useTable({
    table: SUPPORT_FEEDBACK_LIST,
    syncFiltersToURL: true,
    fetchData: createFetcher(supportFeedbacksList),
    filter,
    queryField: 'query',
  });
  const columns: Column<Feedback>[] = [
    {
      title: translate('Issue'),
      render: IssueField,
      export: 'issue_uuid',
    },
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
      orderField: 'user_full_name',
      filter: 'user',
      export: 'user_full_name',
    },
    {
      title: translate('Evaluation'),
      render: ({ row }) => row.evaluation,
      orderField: 'evaluation',
      filter: 'evaluation',
      inlineFilter: (row) =>
        feedbackOptions().find((op) => op.value === row.evaluation),
      export: 'evaluation',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      export: 'created',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('support feedback')}
      expandableRow={SupportFeedbackListExpandableRow}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      enableExport={true}
      showPageSizeSelector={true}
      filters={
        <SupportFeedbacksFilter
          evaluationOptions={feedbackOptions()}
          periodOptions={makeLastTwelveMonthsFilterPeriodsAsCreatedRange()}
        />
      }
      standalone={standalone}
      formId={SupportFeedbacksFilterFormId}
    />
  );
};
