import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';

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
          <span className="me-2">{translate('Backend health status')}</span>
          <RefreshButton refetch={reFetch} loading={loading} />
        </>
      }
      bodyClassName="h-275px"
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : value ? (
        <table className="table table-hover no-margins table-row-bordered mb-0">
          <thead>
            <tr>
              <th>{translate('Check name')}</th>
              <th>{translate('Status')}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(([key, value]: any, index: number) => (
              <tr key={index}>
                <td>{key}</td>
                <td>
                  <StateIndicator
                    label={value}
                    variant={value === 'working' ? 'primary' : 'danger'}
                    outline
                    pill
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </ModalDialog>
  );
};
