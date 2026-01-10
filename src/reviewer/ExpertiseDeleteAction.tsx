import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { client } from 'waldur-js-client/client.gen';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ExpertiseDeleteAction: FunctionComponent<{
  row?;
  refetch?;
  profile;
}> = ({ row, refetch, profile }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete this expertise?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setLoading(true);
    try {
      await client.delete({
        url: `/api/reviewer-profiles/${profile.uuid}/expertise/${row.uuid}/`,
        security: [{ name: 'Authorization', type: 'apiKey' }],
      });
      dispatch(showSuccess(translate('Expertise has been deleted.')));
      refetch?.();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete expertise.')),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, profile.uuid, row.uuid, refetch]);

  return (
    <ActionItem
      title={translate('Delete')}
      action={handleDelete}
      disabled={loading}
    />
  );
};
