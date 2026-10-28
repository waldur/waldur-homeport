import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  FeedbackQuestionSummary,
  FeedbackRequestsListData,
  FeedbackStateEnum,
  feedbackRequestsCount,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

type RequestsQuery = FeedbackRequestsListData['query'];

const columns: Column<FeedbackQuestionSummary>[] = [
  { title: translate('Question'), render: ({ row }) => row.question },
  { title: translate('Answers'), render: ({ row }) => row.answer_count },
  {
    title: translate('Mean'),
    render: ({ row }) => renderFieldOrDash(row.mean),
  },
  {
    title: translate('Distribution'),
    render: ({ row }) =>
      renderFieldOrDash(
        row.distribution
          .map((item) => `${item.label}: ${item.count}`)
          .join(', '),
      ),
  },
];

export const QuestionResults: FC<{
  surveyUuid: string;
  questions: FeedbackQuestionSummary[];
}> = ({ surveyUuid, questions }) => {
  const tableProps = useTable({
    table: `feedback-survey-summary-${surveyUuid}`,
    fetchData: createClientPaginatedFetcher(questions),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [questions]);
  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('questions')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

const STATES: FeedbackStateEnum[] = [
  'answered',
  'pending',
  'dismissed',
  'expired',
];

/** Counts for the rows the filters select, so the cards follow the table. */
export const FeedbackLogsStats: FC<{ filter: RequestsQuery }> = ({
  filter,
}) => {
  const { data } = useQuery({
    queryKey: ['FeedbackLogsStats', filter],
    queryFn: async () => {
      const count = (state?: FeedbackStateEnum) =>
        state && filter.state?.length && !filter.state.includes(state)
          ? Promise.resolve(0)
          : feedbackRequestsCount({
              query: { ...filter, ...(state ? { state: [state] } : {}) },
            }).then(fetchResultCount);
      const [total, ...byState] = await Promise.all([
        count(),
        ...STATES.map((state) => count(state)),
      ]);
      return {
        total,
        ...Object.fromEntries(STATES.map((s, i) => [s, byState[i]])),
      };
    },
  });
  if (!data) return null;
  const rate = data.total
    ? Math.round((data['answered'] / data.total) * 100)
    : 0;
  return (
    <SummaryWidget
      stats={[
        { label: translate('Response rate'), value: `${rate}%` },
        { label: translate('Prompted'), value: data.total },
        { label: translate('Answered'), value: data['answered'] },
        { label: translate('Pending'), value: data['pending'] },
        { label: translate('Dismissed'), value: data['dismissed'] },
        { label: translate('Expired'), value: data['expired'] },
      ]}
    />
  );
};
