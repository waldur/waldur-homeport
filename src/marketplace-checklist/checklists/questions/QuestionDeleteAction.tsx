import { useDispatch } from 'react-redux';
import { checklistsAdminQuestionsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CHECKLIST_TABLE_ID } from '@/marketplace-checklist/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { updateEntity } from '@/table/actions';

export const QuestionDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
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
    onSuccess: () => {
      // Update questions_count on the checklists table
      dispatch(
        updateEntity(CHECKLIST_TABLE_ID, row.checklist_uuid, (entity) => ({
          ...entity,
          questions_count: entity.questions_count - 1,
        })),
      );
    },
    invalidateQueries: [
      { queryKey: ['ChecklistQuestions', row.checklist_uuid] },
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
