import { FilePdfIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { HpcJob, hpcWorkspacesJobsCancel } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { downloadJobReport } from './queries';
import { getHpcErrorMessage, isCancellableJobState } from './utils';

export const HpcJobActions: FC<{
  row: HpcJob;
  resourceUuid: string;
  refetch: () => void;
  /** Cancelling goes through FirecREST. */
  firecrestEnabled?: boolean;
}> = ({ row, resourceUuid, refetch, firecrestEnabled = true }) => {
  const { showError } = useNotify();

  const { mutate: cancel } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      hpcWorkspacesJobsCancel({
        path: { uuid: resourceUuid, job_id: row.job_id },
      }),
    confirmation: {
      title: translate('Cancel job'),
      body: translate(
        'Cancel job {job}? Slurm stops it and its output so far stays on the cluster.',
        { job: <strong>{`${row.job_id} (${row.name})`}</strong> },
        formatJsxTemplate,
      ),
      options: {
        type: 'danger',
        positiveButton: translate('Cancel job'),
        negativeButton: translate('Keep running'),
      },
    },
    successMessage: translate('Job cancellation requested'),
    onError: (error) =>
      showError(
        translate('Unable to cancel the job: {reason}', {
          reason: getHpcErrorMessage(error),
        }),
      ),
    refetch,
    closeModal: false,
  });

  const [downloading, setDownloading] = useState(false);
  const download = () => {
    setDownloading(true);
    downloadJobReport(resourceUuid, row.job_id)
      .catch((error) =>
        showError(
          translate('Unable to create the report: {reason}', {
            reason: getHpcErrorMessage(error),
          }),
        ),
      )
      .finally(() => setDownloading(false));
  };

  return (
    <ActionsDropdown row={row} refetch={refetch}>
      <ActionItem
        title={translate('Download report (PDF)')}
        action={download}
        disabled={downloading}
        iconNode={<FilePdfIcon weight="bold" />}
      />
      {firecrestEnabled && isCancellableJobState(row.state) && (
        <ActionItem
          title={translate('Cancel')}
          action={() => cancel()}
          iconNode={<XCircleIcon weight="bold" />}
          className="text-danger"
          iconColor="danger"
        />
      )}
    </ActionsDropdown>
  );
};
