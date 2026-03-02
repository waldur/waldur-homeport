import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getBackendHealthStatus } from '@waldur/navigation/footer/BackendHealthStatusIndicator';

export const BackendHealthStatusDialog: FunctionComponent = () => {
  const [{ loading, value }, reFetch] = useAsyncFn(getBackendHealthStatus, []);

  useEffectOnce(() => {
    reFetch();
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
