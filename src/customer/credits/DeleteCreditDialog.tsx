import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { projectCreditsList } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { BaseButton } from '@/core/buttons/BaseButton';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SimpleTable } from '@/table/SimpleTable';
import type { Column } from '@/table/types';

interface DeleteCreditDialogProps {
  customerUuid: string;
  customerName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

interface ProjectCreditRow {
  uuid: string;
  project_name: string;
  value: string;
  spendable_value: string;
}

const COLUMNS: Column<ProjectCreditRow>[] = [
  {
    title: translate('Project'),
    render: ({ row }) => <>{row.project_name}</>,
  },
  {
    title: translate('Allocated'),
    className: 'text-end',
    render: ({ row }) => <>{defaultCurrency(row.value)}</>,
  },
  {
    title: translate('Spendable'),
    className: 'text-end',
    render: ({ row }) => <>{defaultCurrency(row.spendable_value)}</>,
  },
];

/**
 * Deleting an organization credit takes the project credits allocated out of it
 * with it — they cannot be drawn without it. That is not obvious from the
 * organization row, so name what disappears before asking to confirm.
 */
export const DeleteCreditDialog: FC<DeleteCreditDialogProps> = ({
  customerUuid,
  customerName,
  onConfirm,
  isPending,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['credit-delete-project-credits', customerUuid],
    queryFn: () =>
      projectCreditsList({ query: { customer_uuid: customerUuid } }).then(
        (response) => (response.data || []) as unknown as ProjectCreditRow[],
      ),
    enabled: Boolean(customerUuid),
    refetchOnWindowFocus: false,
  });

  const projectCredits = data || [];
  const total = projectCredits.reduce(
    (sum, row) => sum + Number(row.value || 0),
    0,
  );

  return (
    <ModalDialog
      title={translate('Delete organization credit')}
      footer={
        <>
          <CloseDialogButton className="min-w-125px" />
          <BaseButton
            variant="danger"
            size="lg"
            className="min-w-125px"
            pending={isPending}
            disabled={isLoading}
            disabledReason={
              isLoading
                ? translate('Loading the allocations funded by this credit…')
                : undefined
            }
            onClick={onConfirm}
            label={
              projectCredits.length > 0
                ? translate('Delete credit and {count} project allocation(s)', {
                    count: projectCredits.length,
                  })
                : translate('Delete')
            }
          />
        </>
      }
    >
      <p>
        {customerName
          ? translate('Delete the credit of {name}?', { name: customerName })
          : translate('Delete this organization credit?')}
      </p>

      {isLoading && <LoadingSpinner />}

      {/* An unreadable list must not read as an empty one: say so rather than
          implying nothing else is affected. */}
      {error && (
        <AlertItem
          variant="warning"
          title={translate('Funded allocations could not be listed')}
          body={translate(
            'Any project allocations funded by this credit will still be deleted.',
          )}
        />
      )}

      {!isLoading && !error && projectCredits.length === 0 && (
        <p className="text-muted">
          {translate('No project allocations are funded by this credit.')}
        </p>
      )}

      {!isLoading && !error && projectCredits.length > 0 && (
        <>
          <AlertItem
            variant="error"
            title={translate(
              '{count} project allocation(s) will be deleted with this credit',
              { count: projectCredits.length },
            )}
            body={translate(
              'They total {total} and cannot be drawn without this credit.',
              { total: defaultCurrency(total) },
            )}
          />
          <SimpleTable columns={COLUMNS} rows={projectCredits} rowKey="uuid" />
        </>
      )}
    </ModalDialog>
  );
};
