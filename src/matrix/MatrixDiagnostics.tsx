import {
  CheckCircleIcon,
  WarningIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { adminMatrixDiagnosticsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

export const MatrixDiagnosticsDialog: FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['matrixDiagnostics'],
    queryFn: () => adminMatrixDiagnosticsRetrieve().then((r) => r.data),
    retry: false,
  });

  return (
    <ModalDialog
      title={translate('Connectivity diagnostics')}
      footer={
        <div className="d-flex justify-content-between w-100">
          <SubmitButton
            submitting={isFetching}
            onClick={() => refetch()}
            disabled={isFetching}
            label={
              <>
                <ArrowClockwiseIcon className="me-1" weight="bold" />
                {isFetching ? translate('Checking...') : translate('Re-check')}
              </>
            }
            className="btn btn-light btn-sm"
          />
          <CloseDialogButton />
        </div>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to run diagnostics.')}
          loadData={refetch}
        />
      ) : data ? (
        <table className="table table-borderless mb-0">
          <tbody>
            {data.checks.map((check) => (
              <tr key={check.name}>
                <td className="text-nowrap pe-3" style={{ width: 24 }}>
                  {check.ok ? (
                    <CheckCircleIcon
                      size={20}
                      weight="fill"
                      className="text-success"
                    />
                  ) : (
                    <WarningIcon
                      size={20}
                      weight="fill"
                      className="text-danger"
                    />
                  )}
                </td>
                <td className="fw-bold text-nowrap pe-4">{check.label}</td>
                <td>
                  <span className={check.ok ? 'text-muted' : 'text-danger'}>
                    {check.detail}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </ModalDialog>
  );
};
