import { FC, useEffect } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AnswerRowActions } from './AnswerRowActions';
import { BooleanIconBadge } from './BooleanIconBadge';
import { ParsedAnswer } from './ParsedAnswer';

interface QuestionWithProjectAnswers {
  question_uuid: string;
  question_description: string;
  question_type: QuestionAdmin['question_type'];
  question_options?: QuestionAdmin['question_options'];
  question_max_value?: QuestionAdmin['max_value'];
  question_min_value?: QuestionAdmin['min_value'];
  required: boolean;
  order: number;
  total_projects: number;
  answered_projects_count: number;
  project_answers: Array<{
    project_uuid: string;
    project_name: string;
    answer_uuid: string;
    answer_data: any;
    answered_by: string;
    answered_at: string;
    requires_review: boolean;
  }>;
}

const getAnswer = (
  row: QuestionWithProjectAnswers['project_answers'][0],
  question,
) =>
  ({
    uuid: row.answer_uuid,
    answer_data: row.answer_data,
    requires_review: row.requires_review,
    question_description: question.description,
  }) as Answer;

export const MetadataByAnswerExpandableRow: FC<{
  row: QuestionWithProjectAnswers;
  fetch(): void;
}> = ({ row: data, fetch }) => {
  const tableProps = useTable({
    table: 'ProjectsMetadata-' + data.question_uuid,
    fetchData: createClientPaginatedFetcher(data.project_answers),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  const question = {
    uuid: data.question_uuid,
    description: data.question_description,
    question_type: data.question_type,
    question_options: data.question_options || [],
    max_value: data.question_max_value,
    min_value: data.question_min_value,
  } as QuestionAdmin;

  return (
    <ExpandableContainer>
      <Table<QuestionWithProjectAnswers['project_answers'][0]>
        {...tableProps}
        columns={[
          {
            title: translate('Project'),
            render: ({ row }) => row.project_name,
          },
          {
            title: translate('Answer'),
            render: ({ row }) => (
              <ParsedAnswer
                question={question}
                answer={getAnswer(row, question)}
              />
            ),
          },
          {
            title: translate('Needs review'),
            render: ({ row }) => (
              <BooleanIconBadge value={row.requires_review} />
            ),
          },
        ]}
        verboseName={translate('Answers')}
        hasActionBar={false}
        minHeight="auto"
        rowActions={({ row }) => (
          <AnswerRowActions
            row={getAnswer(row, question)}
            projectUuid={row.project_uuid}
            question={question}
            fetch={fetch}
          />
        )}
      />
    </ExpandableContainer>
  );
};
