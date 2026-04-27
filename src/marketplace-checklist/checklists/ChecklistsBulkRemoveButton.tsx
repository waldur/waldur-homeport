import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Checklist, checklistsAdminDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/hooks';
import { ActionButton } from '@/table/ActionButton';

interface OwnProps {
  rows: Checklist[];
  refetch(): void;
}

export const ChecklistsBulkRemoveButton = ({ rows, refetch }: OwnProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      const itemsList = rows.map((row) => (
        <li key={row.uuid}>
          {row.name}{' '}
          <span className="text-muted">
            ({translate('{count} questions', { count: row.questions_count })})
          </span>
        </li>
      ));

      const confirmationText = translate(
        'You are about to remove these checklists:',
      );

      const formattedMessage = (
        <div>
          <p>{confirmationText}</p>
          <ul>{itemsList}</ul>
        </div>
      );

      await waitForConfirmation(
        dispatch,
        translate('Remove selected checklists', formatJsxTemplate),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      const promises = rows.map((row) =>
        checklistsAdminDestroy({ path: { uuid: row.uuid } }),
      );

      await Promise.allSettled(promises).then((results) => {
        const error = results.filter((res) => res.status === 'rejected');
        const success = results.filter((res) => res.status === 'fulfilled');

        if (error.length) {
          if (success.length) {
            showSuccess(
              translate('{n} checklists have been removed', {
                n: success.length,
              }),
            );
          }
          showErrorResponse(error[0].reason);
        } else {
          showSuccess(
            translate('Selected checklists have been successfully removed.'),
          );
          closeDialog();
        }
        return results;
      });
      await refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove checklists.'));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
      tooltip={translate('Remove all selected checklists.')}
      disabled={isRemoving}
    />
  );
};
