import { useSelector } from 'react-redux';
import { FeedbackSurvey, feedbackSurveysList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { isStaff } from '@/workspace/selectors';

import {
  FeedbackSurveyCreateButton,
  FeedbackSurveyDeleteAction,
  FeedbackSurveyEditButton,
  FeedbackSurveyResultsAction,
} from './FeedbackSurveyButtons';

const renderAudience = ({ row }: { row: FeedbackSurvey }) => {
  const { all_users, customers = [], offerings = [] } = row.audience || {};
  if (all_users) return translate('All users');
  return [...customers, ...offerings].map((item) => item.name).join(', ');
};

const renderStatus = ({ row }: { row: FeedbackSurvey }) => {
  const scheduled =
    !row.is_open && row.is_active && new Date(row.starts_at) > new Date();
  return (
    <StateIndicator
      variant={row.is_open ? 'success' : scheduled ? 'info' : 'neutral'}
      label={
        row.is_open
          ? translate('Open')
          : scheduled
            ? translate('Scheduled')
            : translate('Closed')
      }
      tone="outline"
      shape="pill"
    />
  );
};

export const FeedbackSurveysList = () => {
  // Support can read surveys; only staff author them.
  const canEdit = useSelector(isStaff);
  const tableProps = useTable({
    table: 'FeedbackSurveys',
    fetchData: createFetcher(feedbackSurveysList),
    queryField: 'name',
  });
  const columns: Column<FeedbackSurvey>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Questionnaire'),
      render: ({ row }) => row.checklist_name,
    },
    {
      title: translate('Audience'),
      render: renderAudience,
    },
    {
      title: translate('Starts at'),
      render: ({ row }) => formatDateTime(row.starts_at),
      orderField: 'starts_at',
    },
    {
      title: translate('Ends at'),
      render: ({ row }) => formatDateTime(row.ends_at),
      orderField: 'ends_at',
    },
    {
      title: translate('Status'),
      render: renderStatus,
    },
  ];

  return (
    <Table<FeedbackSurvey>
      {...tableProps}
      columns={columns}
      verboseName={translate('feedback surveys')}
      hasQuery
      tableActions={
        canEdit && <FeedbackSurveyCreateButton refetch={tableProps.fetch} />
      }
      rowActions={({ row }) => (
        <ActionsDropdown
          row={row}
          refetch={tableProps.fetch}
          actions={
            canEdit
              ? [
                  FeedbackSurveyResultsAction,
                  FeedbackSurveyEditButton,
                  FeedbackSurveyDeleteAction,
                ]
              : [FeedbackSurveyResultsAction]
          }
        />
      )}
    />
  );
};
