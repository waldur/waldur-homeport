import {
  adminArrowCustomerMappingsDestroy,
  ArrowCustomerMapping,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface CustomerMappingsBulkDeleteActionProps {
  rows: ArrowCustomerMapping[];
  refetch: () => void;
}

export const CustomerMappingsBulkDeleteAction = ({
  rows,
  refetch,
}: CustomerMappingsBulkDeleteActionProps) => {
  const confirmationMessage = (
    <div>
      <p>
        {translate(
          'Are you sure you want to delete the following {count} customer mapping(s)?',
          { count: rows.length },
          formatJsxTemplate,
        )}
      </p>
      <ul>
        {rows.map((row) => (
          <li key={row.uuid}>
            {row.arrow_company_name} ({row.arrow_reference})
          </li>
        ))}
      </ul>
    </div>
  );

  const { mutate, isPending } = useBatchMutation<ArrowCustomerMapping, void>({
    rows,
    refetch,
    mutationFn: (row) =>
      adminArrowCustomerMappingsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate(
      '{count} customer mapping(s) have been deleted.',
      {
        count: rows.length,
      },
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} customer mapping(s) have been deleted.', { n }),
    errorMessage: translate('Unable to delete mappings.'),
    renderErrorMessage: (n) =>
      translate('Unable to delete {n} customer mapping(s).', { n }),
    confirmation: {
      title: translate('Delete selected mappings'),
      body: confirmationMessage,
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || rows.length === 0}
      pending={isPending}
      tooltip={translate('Select at least one mapping to delete')}
    />
  );
};
