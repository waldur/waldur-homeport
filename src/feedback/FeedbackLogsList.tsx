import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  FeedbackRequest,
  feedbackRequestsList,
  feedbackSurveysSummaryRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  FeedbackRequestsFilter,
  FeedbackRequestsFilterFormId,
  FeedbackStateOptions,
  selectFeedbackRequestsFilter,
} from '@/table/generated/FeedbackRequestsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { answerText } from './answers';
import { FeedbackLogsExpandableRow } from './FeedbackLogsExpandableRow';
import { FeedbackLogsStats, QuestionResults } from './FeedbackSurveySummary';

const TABLE_ID = 'FeedbackLogs';

const STATE_VARIANTS = {
  answered: 'success',
  dismissed: 'neutral',
  expired: 'neutral',
  pending: 'warning',
} as const;

const stateLabel = (state: FeedbackRequest['state']) =>
  FeedbackStateOptions.find((option) => option.value === state)?.label ?? state;

const renderState = ({ row }: { row: FeedbackRequest }) => (
  <StateIndicator
    variant={STATE_VARIANTS[row.state]}
    label={stateLabel(row.state)}
    tone="outline"
    shape="pill"
  />
);

export const FeedbackLogsList = () => {
  const values = useFilterValues(TABLE_ID);
  const filter = useMemo(() => selectFeedbackRequestsFilter(values), [values]);

  const tableProps = useTable({
    table: TABLE_ID,
    syncFiltersToURL: true,
    fetchData: createFetcher(feedbackRequestsList),
    filter,
  });

  const { data: summary } = useQuery({
    queryKey: ['FeedbackSurveySummary', filter.survey_uuid],
    queryFn: () =>
      feedbackSurveysSummaryRetrieve({
        path: { uuid: filter.survey_uuid },
      }).then((response) => response.data),
    enabled: Boolean(filter.survey_uuid),
  });

  // Filtered to one survey, the export gets a column per question; otherwise
  // all answers go into one column. No column has an id: with ids the export
  // follows the column positions recorded on mount, before these exist.
  const answerColumns: Column<FeedbackRequest>[] = summary
    ? summary.questions.map((question) => ({
        visible: false,
        title: question.question,
        render: null,
        export: (row) => {
          const answer = row.answers.find(
            (item) => item.question_uuid === question.question_uuid,
          );
          return answer ? answerText(answer) : '';
        },
      }))
    : [
        {
          visible: false,
          title: translate('Answers'),
          render: null,
          export: (row) =>
            row.answers
              .map((answer) => `${answer.question} ${answerText(answer)}`)
              .join('; '),
        },
      ];

  const columns: Column<FeedbackRequest>[] = [
    {
      title: translate('Survey'),
      render: ({ row }) => row.survey_name,
      export: 'survey_name',
    },
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name || row.user_username,
      export: 'user_full_name',
    },
    {
      title: translate('Organization'),
      render: ({ row }) => renderFieldOrDash(row.organization_names.join(', ')),
      export: (row) => row.organization_names.join(', '),
    },
    {
      title: translate('State'),
      render: renderState,
      orderField: 'state',
      export: (row) => stateLabel(row.state),
    },
    {
      title: translate('Prompted'),
      render: ({ row }) => row.prompt_count,
      orderField: 'prompt_count',
      export: 'prompt_count',
    },
    {
      title: translate('Answered at'),
      render: ({ row }) =>
        renderFieldOrDash(row.answered_at && formatDateTime(row.answered_at)),
      orderField: 'answered_at',
      export: (row) => (row.answered_at ? formatDateTime(row.answered_at) : ''),
    },
    ...answerColumns,
  ];

  return (
    <>
      <FeedbackLogsStats filter={filter} />
      {summary && (
        <div className="mb-5">
          <QuestionResults
            surveyUuid={filter.survey_uuid}
            questions={summary.questions}
          />
        </div>
      )}
      <Table<FeedbackRequest>
        {...tableProps}
        columns={columns}
        verboseName={translate('feedback logs')}
        expandableRow={FeedbackLogsExpandableRow}
        isRowExpandable={(row) => row.answers.length > 0}
        initialSorting={{ field: 'created', mode: 'desc' }}
        enableExport
        filters={<FeedbackRequestsFilter />}
        formId={FeedbackRequestsFilterFormId}
      />
    </>
  );
};
