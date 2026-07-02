import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { adminMatrixLivekitOverviewRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionButton } from '@/table/ActionButton';

import { getErrorDetail, isNotConfiguredError } from './liveKitFormatters';
import { LiveKitRoomsTable } from './LiveKitRoomsTable';

const LiveKitCallsTab: FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['liveKitOverview'],
    queryFn: () => adminMatrixLivekitOverviewRetrieve().then((r) => r.data),
    refetchInterval: 10_000,
    retry: false,
    // We render our own 503/502 UI below; a 503 would otherwise hit the global
    // error handler (queryClient.ts) on every poll.
    meta: { skipGlobalErrorRedirect: true },
  });

  const renderBody = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      // 503 means the LiveKit profile is simply not deployed — a quiet,
      // expected state rather than an error worth a retry button or a toast.
      if (isNotConfiguredError(error)) {
        return (
          <NoResult
            title={translate('LiveKit profile not active')}
            message={
              getErrorDetail(error) || translate('LiveKit is not configured.')
            }
            noAction
          />
        );
      }
      return (
        <NoResult
          title={getErrorDetail(error) || translate('LiveKit is unreachable.')}
          message={null}
          actions={
            <SubmitButton
              submitting={isFetching}
              type="button"
              variant="tertiary"
              className="mw-175px min-w-120px w-50"
              onClick={() => refetch()}
              label={translate('Retry')}
            />
          }
        />
      );
    }
    if (data) {
      if (data.rooms.length === 0) {
        return (
          <NoResult
            title={translate('No active calls right now')}
            message={translate('Rooms will appear here when a call starts.')}
            actions={
              <SubmitButton
                submitting={isFetching}
                type="button"
                variant="tertiary"
                className="mw-175px min-w-120px w-50"
                onClick={() => refetch()}
                label={translate('Refresh')}
              />
            }
          />
        );
      }
      return <LiveKitRoomsTable data={data} />;
    }
    return null;
  };

  return (
    <div className="mt-5">
      {/* Error, not-configured, and empty states each render their own action
          (Retry / none / Refresh), so the top-bar Refresh appears only when the
          rooms table itself is on screen. */}
      {data && !error && data.rooms.length > 0 && (
        <div className="d-flex justify-content-end mb-3">
          <ActionButton
            title={translate('Refresh')}
            action={() => refetch()}
            iconNode={<ArrowClockwiseIcon weight="bold" />}
            variant="tertiary"
            disabled={isFetching}
            disabledReason={translate('Refreshing…')}
          />
        </div>
      )}
      {renderBody()}
    </div>
  );
};

export default LiveKitCallsTab;
