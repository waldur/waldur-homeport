import { useMemo } from 'react';
import { openstackSecurityGroupsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

export const DestroyBulkSecurityGroupsAction = ({ rows, refetch }) => {
  const filteredRows = useMemo(
    () => rows.filter((row) => row.name !== 'default'),
    [rows],
  );

  const { mutate, isPending } = useBatchMutation<any, void>({
    rows: filteredRows,
    refetch,
    mutationFn: (row) =>
      openstackSecurityGroupsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate(
      'Security groups have been removed from resource successfully.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('Successfully removed {n} security groups from resource.', {
        n,
      }),
    errorMessage: translate('Unable to remove security groups from resource.'),
    renderErrorMessage: (n) =>
      translate('Unable to remove {n} security groups from resource.', { n }),
    confirmation: {
      title: translate('Remove selected security groups'),
      body: (
        <div>
          <p>
            {translate(
              'You are about to remove these security groups from the resource.',
            )}
          </p>
          <ul>
            {filteredRows.map((row) => (
              <li key={row.uuid}>{row.name || row.description}</li>
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
      disabled={isPending || !filteredRows.length}
      tooltip={
        !filteredRows.length &&
        translate('The default security group cannot be deleted.')
      }
    />
  );
};
