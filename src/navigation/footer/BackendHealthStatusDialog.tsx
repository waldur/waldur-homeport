import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { getBackendHealthStatus } from '@/navigation/footer/BackendHealthStatusIndicator';

export const BackendHealthStatusDialog: FunctionComponent = () => {
  const {
    isLoading: loading,
    data: value,
    refetch: reFetch,
  } = useQuery({
    queryKey: ['BackendHealthStatusDialog'],
    queryFn: getBackendHealthStatus,
  });

  return (
    <ModalDialog
      title={
        <>
          <span className="me-1.5">{translate('Backend health status')}</span>
          <RefreshButton refetch={reFetch} loading={loading} />
        </>
      }
      bodyClassName="h-[275px]"
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : value ? (
        <Table className="mb-0">
          <TableHeader>
            <TableRow>
              <TableHead>{translate('Check name')}</TableHead>
              <TableHead>{translate('Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(value).map(([key, value]: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{key}</TableCell>
                <TableCell>
                  <StateIndicator
                    label={value}
                    variant={value === 'working' ? 'primary' : 'danger'}
                    tone="outline"
                    shape="pill"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </ModalDialog>
  );
};
