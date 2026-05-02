import { useMemo } from 'react';
import { openstackFloatingIpsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { validateState } from '@/resource/actions/base';
import { parseValidators } from '@/resource/actions/utils';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { useUser } from '@/workspace/hooks';

const validators = [validateState('OK', 'ERRED')];

export const DestroyBulkFloatingIpsAction = ({ rows, refetch }) => {
  const user = useUser();

  const rowsData = useMemo(() => {
    let error;
    const _rows = rows.filter((row) => {
      const tooltip = parseValidators(validators, { user, resource: row });
      const disabled = tooltip !== undefined;
      if (disabled) error = tooltip;

      return !disabled;
    });
    return { error, rows: _rows };
  }, [rows, user]);

  const formattedMessage = (
    <div>
      <p>
        {translate(
          'You are about to remove these floating IPs from the resource.',
        )}
      </p>
      <ul>
        {rowsData.rows.map((row) => (
          <li key={row.uuid}>{row.name || row.address}</li>
        ))}
      </ul>
    </div>
  );

  const { mutate, isPending } = useBatchMutation<any, void>({
    rows: rowsData.rows,
    refetch,
    mutationFn: (row) =>
      openstackFloatingIpsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Floating IPs removal has been scheduled.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} floating IPs removal has been scheduled.', { n }),
    errorMessage: translate('Unable to remove floating IPs from resource.'),
    renderErrorMessage: (n) =>
      translate('Unable to remove {n} floating IPs from resource.', { n }),
    confirmation: {
      title: translate('Remove selected floating IPs'),
      body: formattedMessage,
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={mutate}
      disabled={isPending || rowsData.error}
      tooltip={rowsData.error}
    />
  );
};
