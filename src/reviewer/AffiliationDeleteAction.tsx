import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { nestedReviewerProfileAffiliationsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const AffiliationDeleteAction: FunctionComponent<{
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
        translate('Are you sure you want to delete this affiliation?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setLoading(true);
    try {
      await nestedReviewerProfileAffiliationsDestroy({
        path: { reviewer_profile_uuid: profile.uuid, uuid: row.uuid },
      });
      dispatch(showSuccess(translate('Affiliation has been deleted.')));
      refetch?.();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete affiliation.')),
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
