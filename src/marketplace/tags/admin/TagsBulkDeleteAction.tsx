import { marketplaceTagsDestroy, Tag } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface TagsBulkDeleteActionProps {
  rows: Tag[];
  refetch: () => void;
}

export const TagsBulkDeleteAction = ({
  rows,
  refetch,
}: TagsBulkDeleteActionProps) => {
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

  const { mutate, isPending } = useBatchMutation<Tag, void>({
    rows,
    refetch,
    mutationFn: (row) => marketplaceTagsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('{count} tag(s) have been deleted.', {
      count: rows.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('{n} tag(s) have been deleted.', { n }),
    errorMessage: translate('Unable to delete tags.'),
    renderErrorMessage: (n) =>
      translate('{n} tag(s) could not be deleted.', { n }),
    confirmation: {
      title: translate('Delete selected tags'),
      body: confirmationMessage,
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || rows.length === 0}
      disabledReason={
        rows.length === 0
          ? translate('No tags selected')
          : translate('Deletion in progress')
      }
      pending={isPending}
    />
  );
};
