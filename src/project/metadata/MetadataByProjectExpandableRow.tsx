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

type ProjectAnswer = Pick<
  Answer,
  | 'answer_data'
  | 'question_description'
  | 'question_type'
  | 'user_name'
  | 'created'
  | 'modified'
> &
  Pick<QuestionAdmin, 'question_options' | 'min_value' | 'max_value'> & {
    answer_labels: any;
    question_uuid: string;
  };

interface ProjectDetails {
  answers: ProjectAnswer[];
  completion_percentage: number;
  completion_uuid: string;
  is_completed: boolean;
  project_name: string;
  project_uuid: string;
  requires_review: boolean;
  unanswered_required_questions: any[];
}

const getQuestion = (row: ProjectAnswer) =>
  ({
    uuid: row.question_uuid,
    description: row.question_description,
    question_type: row.question_type,
    question_options: row.question_options,
    min_value: row.min_value,
    max_value: row.max_value,
  }) as QuestionAdmin;

export const MetadataByProjectExpandableRow: FC<{
  row: ProjectDetails;
  fetch;
}> = ({ row: projectDetails, fetch }) => {
  const tableProps = useTable({
    table: 'ProjectsMetadataByProject-' + projectDetails.project_uuid,
    fetchData: createClientPaginatedFetcher(projectDetails.answers),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [projectDetails]);

  return (
    <ExpandableContainer>
      <Table<ProjectAnswer>
        {...tableProps}
        columns={[
          {
            title: translate('Question'),
            render: ({ row }) => row.question_description,
          },
          {
            title: translate('Answer'),
            render: ({ row }) => (
              <ParsedAnswer question={getQuestion(row)} answer={row as any} />
            ),
          },
          {
            title: translate('Needs review'),
            render: () => (
              <BooleanIconBadge value={projectDetails.requires_review} />
            ),
          },
        ]}
        verboseName={translate('Answers')}
        hasActionBar={false}
        minHeight="auto"
        rowActions={({ row }) => (
          <AnswerRowActions
            row={row}
            projectUuid={projectDetails.project_uuid}
            question={getQuestion(row)}
            fetch={fetch}
          />
        )}
      />
    </ExpandableContainer>
  );
};
