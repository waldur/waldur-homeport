import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { client } from 'waldur-js-client/client.gen';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const PublicationDeleteAction: FunctionComponent<{
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
        translate('Are you sure you want to delete this publication?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setLoading(true);
    try {
      await client.delete({
        url: `/api/reviewer-profiles/${profile.uuid}/publications/${row.uuid}/`,
        security: [{ name: 'Authorization', type: 'apiKey' }],
      });
      dispatch(showSuccess(translate('Publication has been deleted.')));
      refetch?.();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete publication.')),
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
