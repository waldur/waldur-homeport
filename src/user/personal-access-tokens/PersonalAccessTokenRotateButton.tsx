import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { personalAccessTokensRotate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { personalAccessTokenSecretDialog } from './secretActions';

export const PersonalAccessTokenRotateButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRotate = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Rotate token'),
        translate(
          'Are you sure you want to rotate this token? The current token will stop working immediately and a new token will be generated.',
        ),
      );
    } catch {
      return;
    }

    setLoading(true);
    try {
      const response = await personalAccessTokensRotate({
        path: { uuid: row.uuid },
      });
      dispatch(showSuccess(translate('Token has been rotated.')));
      await refetch?.();
      dispatch(
        personalAccessTokenSecretDialog(
          response.data.token,
          response.data.name,
        ),
      );
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to rotate token.')));
    } finally {
      setLoading(false);
    }
  }, [dispatch, row, refetch]);

  return (
    <ActionItem
      title={translate('Rotate')}
      action={handleRotate}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={loading || !row.is_active}
      tooltip={
        !row.is_active ? translate('Cannot rotate a revoked token.') : undefined
      }
    />
  );
};
