import {
  CheckCircleIcon,
  WarningIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { adminMatrixDiagnosticsRetrieve } from 'waldur-js-client';

import { Table, TableBody, TableCell, TableRow } from 'waldur-ui';

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
      title={translate('Matrix diagnostics')}
      footer={
        <div className="flex justify-between w-full">
          <CloseDialogButton />
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
            variant="tertiary"
            size="sm"
          />
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
        <Table scrollable={false} className="mb-0">
          <TableBody>
            {data.checks.map((check) => (
              <TableRow key={check.name} divided={false}>
                <TableCell className="whitespace-nowrap pe-2.5 w-6">
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
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap pe-3">
                  {check.label}
                </TableCell>
                <TableCell>
                  <span
                    className={check.ok ? 'text-quaternary' : 'text-danger'}
                  >
                    {check.detail}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </ModalDialog>
  );
};
