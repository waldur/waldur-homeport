import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import {
  CoiDetectionJob,
  coiDetectionJobsList,
  coiDetectionJobsRetrieve,
  proposalProtectedCallsDetectConflicts,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

const POLL_INTERVAL = 3000;

const isActive = (job?: CoiDetectionJob | null) =>
  job?.state === 'pending' || job?.state === 'running';

interface DetectConflictsButtonProps {
  call: Call;
  refetch: () => void;
}

/**
 * Starts automated conflict of interest detection for the call. Detection
 * runs as a background job: the button stays busy while it runs and the
 * conflicts list is reloaded when it ends.
 */
export const DetectConflictsButton: FC<DetectConflictsButtonProps> = ({
  call,
  refetch,
}) => {
  const { showSuccess, showError } = useNotify();
  const [jobUuid, setJobUuid] = useState<string | null>(null);

  // A run started earlier (or by someone else) is picked up, so the
  // manager is not offered a second one while it is still going.
  const { data: runningJob } = useQuery({
    queryKey: ['coi-detection-running-job', call.uuid],
    queryFn: () =>
      coiDetectionJobsList({
        query: {
          call_uuid: call.uuid,
          state: ['pending', 'running'],
          page_size: 1,
        },
      }).then((response) => response.data?.[0] ?? null),
  });

  useEffect(() => {
    if (runningJob?.uuid) {
      setJobUuid(runningJob.uuid);
    }
  }, [runningJob?.uuid]);

  const { data: job } = useQuery({
    queryKey: ['coi-detection-job', jobUuid],
    queryFn: () =>
      coiDetectionJobsRetrieve({ path: { uuid: jobUuid } }).then(
        (response) => response.data,
      ),
    enabled: Boolean(jobUuid),
    refetchInterval: (query) =>
      !query.state.data || isActive(query.state.data) ? POLL_INTERVAL : false,
  });

  useEffect(() => {
    if (!job || job.uuid !== jobUuid || isActive(job)) {
      return;
    }
    if (job.state === 'completed') {
      showSuccess(
        translate('Conflict detection finished: {count} new conflicts found.', {
          count: job.conflicts_found,
        }),
      );
    } else if (job.state === 'failed') {
      showError(
        job.error_message ||
          translate('Conflict detection failed. Please try again.'),
      );
    }
    setJobUuid(null);
    refetch();
  }, [job, jobUuid, refetch, showSuccess, showError]);

  const mutation = useManagedMutation({
    mutationFn: () =>
      proposalProtectedCallsDetectConflicts({
        path: { uuid: call.uuid },
        body: { job_type: 'full_call' },
      }).then((response) => response.data),
    // The error toast carries the backend's reason, such as detection being
    // turned off on this platform.
    errorMessage: translate('Unable to start conflict detection.'),
    closeModal: false,
    onSuccess: (data) => {
      showSuccess(
        translate(
          'Conflict detection started. The list is updated when it finishes.',
        ),
      );
      setJobUuid(data.uuid);
    },
  });

  const running = Boolean(jobUuid);

  return (
    <BaseButton
      onClick={() => mutation.mutate(undefined)}
      label={translate('Detect conflicts')}
      iconNode={<MagnifyingGlassIcon weight="bold" />}
      variant="tertiary"
      size="lg"
      pending={mutation.isPending || running}
      disabledReason={
        running
          ? job?.total_pairs
            ? translate(
                'Conflict detection is running: {processed} of {total} pairs checked.',
                { processed: job.processed_pairs, total: job.total_pairs },
              )
            : translate('Conflict detection is running.')
          : undefined
      }
    />
  );
};
