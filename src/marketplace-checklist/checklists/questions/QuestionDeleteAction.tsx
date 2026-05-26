import { checklistsAdminQuestionsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CHECKLIST_TABLE_ID } from '@/marketplace-checklist/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const QuestionDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      checklistsAdminQuestionsDestroy({
        path: { uuid: row.uuid },
      }),
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete this question?'),
      options: { forDeletion: true },
    },
    invalidateQueries: [
      { queryKey: ['ChecklistQuestions', row.checklist_uuid] },
      { queryKey: ['table', CHECKLIST_TABLE_ID] },
    ],
    refetch,
    successMessage: translate('Question has been deleted.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
