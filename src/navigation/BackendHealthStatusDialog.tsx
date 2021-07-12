import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getBackendHealthStatus } from '@waldur/navigation/BackendHealthStatusIndicator';

export const BackendHealthStatusDialog: FunctionComponent = () => {
  const [{ loading, error, value }, reFetch] = useAsyncFn(
    getBackendHealthStatus,
    [],
  );

  useEffectOnce(() => {
    reFetch();
  });

  return (
    <ModalDialog
      title={translate('Backend health status')}
      footer={<CloseDialogButton />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>{translate('Unable to load backend health status.')}</p>
      ) : value ? (
        <>
          <div className="pull-right">
            <button className="btn btn-default btn-sm" onClick={reFetch}>
              <i className="fa fa-refresh" /> {translate('Refresh')}
            </button>
          </div>
          <table className="table table-hover no-margins">
            <thead>
              <tr>
                <th>{translate('Check name')}</th>
                <th>{translate('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(value.data).map(
                ([key, value]: any, index: number) => (
                  <tr key={index}>
                    <td>{translate(key)}</td>
                    <td>
                      <StateIndicator
                        label={translate(value)}
                        variant={value === 'working' ? 'primary' : 'danger'}
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </>
      ) : null}
    </ModalDialog>
  );
};
