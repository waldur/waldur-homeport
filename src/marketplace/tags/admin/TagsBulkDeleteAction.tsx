import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { marketplaceTagsDestroy, Tag } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface TagsBulkDeleteActionProps {
  rows: Tag[];
  refetch: () => void;
}

export const TagsBulkDeleteAction = ({
  rows,
  refetch,
}: TagsBulkDeleteActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const rowsList = rows.map((row) => <li key={row.uuid}>{row.name}</li>);

      const confirmationMessage = (
        <div>
          <p>
            {translate(
              'Are you sure you want to delete the following {count} tag(s)?',
              { count: rows.length },
              formatJsxTemplate,
            )}
          </p>
          <ul>{rowsList}</ul>
        </div>
      );

      try {
        await waitForConfirmation(
          dispatch,
          translate('Delete selected tags'),
          confirmationMessage,
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        const promises = rows.map((row) =>
          marketplaceTagsDestroy({ path: { uuid: row.uuid } }),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('{count} tag(s) have been deleted.', {
              count: rows.length,
            }),
          ),
        );
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to delete tags.')));
      }
    },
  });

  return (
    <ActionButton
      title={translate('Delete')}
      action={mutate}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
      disabled={isPending || rows.length === 0}
      pending={isPending}
    />
  );
};
