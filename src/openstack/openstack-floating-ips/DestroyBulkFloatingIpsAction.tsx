import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { openstackFloatingIpsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { validateState } from '@waldur/resource/actions/base';
import { parseValidators } from '@waldur/resource/actions/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

const validators = [validateState('OK', 'ERRED')];

export const DestroyBulkFloatingIpsAction = ({ rows, refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

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

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const rowsList = rowsData.rows.map((row) => (
          <li key={row.uuid}>{row.name || row.address}</li>
        ));

        const confirmationText = translate(
          'You are about to remove these floating IPs from the resource.',
        );

        const formattedMessage = (
          <div>
            <p>{confirmationText}</p>
            <ul>{rowsList}</ul>
          </div>
        );

        await waitForConfirmation(
          dispatch,
          translate('Remove selected floating IPs'),
          formattedMessage,
          { forDeletion: true },
        );
      } catch {
        return;
      }
      try {
        const promises = rowsData.rows.map((row) =>
          openstackFloatingIpsDestroy({ path: { uuid: row.uuid } }),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(translate('Floating IPs removal has been scheduled.')),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to remove floating IPs from resource.'),
          ),
        );
      }
    },
  });

  return (
    <ActionButton
      title={translate('Remove')}
      action={mutate}
      iconNode={<TrashIcon weight="bold" />}
      variant="light-danger"
      disabled={isPending || rowsData.error}
      tooltip={rowsData.error}
    />
  );
};
