import { FC } from 'react';
import {
  Checklist,
  checklistsAdminChecklistQuestions,
  QuestionAdmin,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { questionTypeOptions } from '../utils';

import { QuestionRowActions } from './questions/QuestionRowActions';

export const ChecklistExpandableRow: FC<{
  row: Checklist;
}> = ({ row: checklist }) => {
  const tableProps = useTable({
    table: 'ChecklistQuestions-' + checklist.uuid,
    fetchData: createFetcher(checklistsAdminChecklistQuestions, {
      path: { uuid: checklist.uuid },
    }),
  });

  return (
    <ExpandableContainer asTable>
      <Table<QuestionAdmin>
        {...tableProps}
        columns={[
          {
            title: translate('Questions'),
            render: ({ row }) => row.description,
          },
          {
            title: translate('Question type'),
            render: ({ row }) =>
              questionTypeOptions.find((q) => q.value === row.question_type)
                ?.label || row.question_type,
          },
          {
            title: translate('Order'),
            render: ({ row }) => row.order,
          },
        ]}
        verboseName={translate('Questions')}
        hasActionBar={false}
        minHeight="auto"
        rowActions={QuestionRowActions}
        initialPageSize={5}
        showPageSizeSelector={true}
      />
    </ExpandableContainer>
  );
};
