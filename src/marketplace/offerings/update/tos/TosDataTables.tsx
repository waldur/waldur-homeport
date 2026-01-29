import { FC, useState } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

type TableType =
  | 'versionAdoption'
  | 'consentStatus'
  | 'acceptedTrend'
  | 'revokedTrend';

interface TosDataTablesProps {
  data: ToSConsentDashboard;
  selectedTable: TableType;
}

export const TosDataTables: FC<TosDataTablesProps> = ({
  data,
  selectedTable,
}) => {
  const [showAllAcceptedMonths, setShowAllAcceptedMonths] = useState(false);
  const [showAllRevokedMonths, setShowAllRevokedMonths] = useState(false);

  return (
    <>
      {selectedTable === 'versionAdoption' && (
        <div
          className="border border-secondary rounded"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-3">{translate('Version adoption')}</h6>
          <div className="table-responsive">
            <table className="table table-row-bordered table-row-gray-200">
              <thead>
                <tr>
                  <th>{translate('Version')}</th>
                  <th className="text-end">{translate('Users')}</th>
                </tr>
              </thead>
              <tbody>
                {data.tos_version_adoption.length > 0 ? (
                  data.tos_version_adoption.map((item) => (
                    <tr key={item.version}>
                      <td>{item.version}</td>
                      <td className="text-end">{item.users_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      {translate('No data available')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTable === 'consentStatus' && (
        <div
          className="border border-secondary rounded"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-3">{translate('Consent status breakdown')}</h6>
          <div className="table-responsive">
            <table className="table table-row-bordered table-row-gray-200">
              <thead>
                <tr>
                  <th>{translate('Status')}</th>
                  <th className="text-end">{translate('Count')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{translate('Accepted')}</td>
                  <td className="text-end">{data.accepted_consents_count}</td>
                </tr>
                <tr>
                  <td>{translate('Pending')}</td>
                  <td className="text-end">
                    {data.active_users_count -
                      data.accepted_consents_count -
                      data.revoked_consents_count}
                  </td>
                </tr>
                <tr>
                  <td>{translate('Revoked')}</td>
                  <td className="text-end">{data.revoked_consents_count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTable === 'acceptedTrend' && (
        <div
          className="border border-secondary rounded"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-3">{translate('Accepted consents trend')}</h6>
          <div className="table-responsive">
            <table className="table table-row-bordered table-row-gray-200">
              <thead>
                <tr>
                  <th>{translate('Month')}</th>
                  <th className="text-end">{translate('Count')}</th>
                </tr>
              </thead>
              <tbody>
                {((data as any).accepted_consents_over_time || []).length >
                0 ? (
                  (showAllAcceptedMonths
                    ? (data as any).accepted_consents_over_time
                    : (data as any).accepted_consents_over_time.slice(-4)
                  ).map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td className="text-end">{item.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      {translate('No data available')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {((data as any).accepted_consents_over_time || []).length > 4 && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => setShowAllAcceptedMonths(!showAllAcceptedMonths)}
              >
                {showAllAcceptedMonths
                  ? translate('Show recent months')
                  : translate('Show all months')}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedTable === 'revokedTrend' && (
        <div
          className="border border-secondary rounded"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-3">{translate('Revoked consents trend')}</h6>
          <div className="table-responsive">
            <table className="table table-row-bordered table-row-gray-200">
              <thead>
                <tr>
                  <th>{translate('Month')}</th>
                  <th className="text-end">{translate('Count')}</th>
                </tr>
              </thead>
              <tbody>
                {data.revoked_consents_over_time.length > 0 ? (
                  (showAllRevokedMonths
                    ? data.revoked_consents_over_time
                    : data.revoked_consents_over_time.slice(-4)
                  ).map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td className="text-end">{item.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center text-muted">
                      {translate('No data available')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {data.revoked_consents_over_time.length > 4 && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => setShowAllRevokedMonths(!showAllRevokedMonths)}
              >
                {showAllRevokedMonths
                  ? translate('Show recent months')
                  : translate('Show all months')}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
