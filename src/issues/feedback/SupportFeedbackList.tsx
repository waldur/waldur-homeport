import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Feedback, supportFeedbacksList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { SUPPORT_FEEDBACK_LIST } from '@waldur/issues/feedback/constants';
import { IssueField } from '@waldur/issues/feedback/IssueField';
import { SupportFeedbackListExpandableRow } from '@waldur/issues/feedback/SupportFeedbackListExpandableRow';
import { makeLastTwelveMonthsFilterPeriodsAsCreatedRange } from '@waldur/issues/utils';
import { createFetcher } from '@waldur/table/api';
import {
  selectSupportFeedbacksFilter,
  SupportFeedbacksFilter,
} from '@waldur/table/generated/SupportFeedbacksFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { feedbackOptions } from './utils';

interface SupportFeedbackListProps {
  standalone?: boolean;
}

export const SupportFeedbackList: FC<SupportFeedbackListProps> = ({
  standalone = false,
}) => {
  const filter = useSelector(selectSupportFeedbacksFilter);
  const props = useTable({
    table: SUPPORT_FEEDBACK_LIST,
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
    />
  );
};
