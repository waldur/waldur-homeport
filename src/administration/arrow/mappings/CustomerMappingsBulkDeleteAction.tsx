import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  adminArrowCustomerMappingsDestroy,
  ArrowCustomerMapping,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface CustomerMappingsBulkDeleteActionProps {
  rows: ArrowCustomerMapping[];
  refetch: () => void;
}

export const CustomerMappingsBulkDeleteAction = ({
  rows,
  refetch,
}: CustomerMappingsBulkDeleteActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const rowsList = rows.map((row) => (
        <li key={row.uuid}>
          {row.arrow_company_name} ({row.arrow_reference})
        </li>
      ));

      const confirmationMessage = (
        <div>
          <p>
            {translate(
              'Are you sure you want to delete the following {count} customer mapping(s)?',
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
          translate('Delete selected mappings'),
          confirmationMessage,
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        const promises = rows.map((row) =>
          adminArrowCustomerMappingsDestroy({ path: { uuid: row.uuid } }),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('{count} customer mapping(s) have been deleted.', {
              count: rows.length,
            }),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to delete mappings.')),
        );
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
