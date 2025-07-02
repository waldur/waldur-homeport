import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { openstackSecurityGroupsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const DestroyBulkSecurityGroupsAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();

  const filteredRows = useMemo(
    () => rows.filter((row) => row.name !== 'default'),
    [rows],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const rowsList = filteredRows.map((row) => (
          <li key={row.uuid}>{row.name || row.description}</li>
        ));

        const confirmationText = translate(
          'You are about to remove these security groups from the resource.',
        );

        const formattedMessage = (
          <div>
            <p>{confirmationText}</p>
            <ul>{rowsList}</ul>
          </div>
        );

        await waitForConfirmation(
          dispatch,
          translate('Remove selected security groups'),
          formattedMessage,
          { forDeletion: true },
        );
      } catch {
        return;
      }
      try {
        const promises = filteredRows.map((row) =>
          openstackSecurityGroupsDestroy({ path: { uuid: row.uuid } }),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate(
              'Security groups have been removed from resource successfully.',
            ),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to remove security groups from resource.'),
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
      disabled={isPending || !filteredRows.length}
      tooltip={
        !filteredRows.length &&
        translate('The default security group cannot be deleted.')
      }
    />
  );
};
