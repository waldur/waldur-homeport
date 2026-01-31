import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { useSyncFromArrow } from '../api';

export const CustomerMappingSyncAction = ({
  row,
  refetch,
}: {
  row: ArrowCustomerMapping;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  const syncFromArrow = useSyncFromArrow();
  const [loading, setLoading] = useState(false);

  const handleSync = useCallback(async () => {
    setLoading(true);
    try {
      await syncFromArrow.mutateAsync({
        settings_uuid: row.settings_uuid,
      });
      dispatch(showSuccess(translate('Sync from Arrow triggered')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Failed to trigger sync')));
    } finally {
      setLoading(false);
    }
  }, [dispatch, syncFromArrow, row.settings_uuid, refetch]);

  return (
    <ActionItem
      action={handleSync}
      title={translate('Sync from Arrow')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={loading}
    />
  );
};
