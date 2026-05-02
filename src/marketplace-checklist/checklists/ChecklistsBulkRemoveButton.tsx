import { Checklist, checklistsAdminDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface OwnProps {
  rows: Checklist[];
  refetch(): void;
}

export const ChecklistsBulkRemoveButton = ({ rows, refetch }: OwnProps) => {
  const { mutate, isPending } = useBatchMutation({
    rows,
    refetch,
    mutationFn: (row) => checklistsAdminDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate(
      'Selected checklists have been successfully removed.',
    ),
    errorMessage: translate('Unable to remove checklists.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} checklists have been removed', { n }),
    confirmation: {
      title: translate('Remove selected checklists'),
      body: (
        <div>
          <p>{translate('You are about to remove these checklists:')}</p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>
                {row.name}{' '}
                <span className="text-muted">
                  (
                  {translate('{count} questions', {
                    count: row.questions_count,
                  })}
                  )
                </span>
              </li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={mutate}
      tooltip={translate('Remove all selected checklists.')}
      pending={isPending}
      disabled={isPending}
      disabledReason={isPending ? translate('Removal in progress') : undefined}
    />
  );
};
