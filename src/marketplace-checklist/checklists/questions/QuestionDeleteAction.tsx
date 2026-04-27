import { TrashIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { checklistsAdminQuestionsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CHECKLIST_TABLE_ID } from '@/marketplace-checklist/constants';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { updateEntity } from '@/table/actions';

export const QuestionDeleteAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete this question?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await checklistsAdminQuestionsDestroy({
      path: { uuid: row.uuid },
    });
    // Update questions_count on the checklists table
    dispatch(
      updateEntity(CHECKLIST_TABLE_ID, row.checklist_uuid, (entity) => ({
        ...entity,
        questions_count: entity.questions_count - 1,
      })),
    );
    // Invalidate checklist questions query
    queryClient.invalidateQueries({
      queryKey: ['ChecklistQuestions', row.checklist_uuid],
    });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
