import { FC, useState } from 'react';
import type { ToSConsentDashboard } from 'waldur-js-client';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';

type TableType =
  'versionAdoption' | 'consentStatus' | 'acceptedTrend' | 'revokedTrend';

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
          className="border border-secondary rounded-lg"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-2.5">{translate('Version adoption')}</h6>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Version')}</TableHead>
                <TableHead className="text-end">{translate('Users')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tos_version_adoption.length > 0 ? (
                data.tos_version_adoption.map((item) => (
                  <TableRow key={item.version}>
                    <TableCell>{item.version}</TableCell>
                    <TableCell className="text-end">
                      {item.users_count}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-quaternary"
                  >
                    {translate('No data available')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedTable === 'consentStatus' && (
        <div
          className="border border-secondary rounded-lg"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-2.5">{translate('Consent status breakdown')}</h6>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Status')}</TableHead>
                <TableHead className="text-end">{translate('Count')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{translate('Accepted')}</TableCell>
                <TableCell className="text-end">
                  {data.accepted_consents_count}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{translate('Pending')}</TableCell>
                <TableCell className="text-end">
                  {data.active_users_count -
                    data.accepted_consents_count -
                    data.revoked_consents_count}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{translate('Revoked')}</TableCell>
                <TableCell className="text-end">
                  {data.revoked_consents_count}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {selectedTable === 'acceptedTrend' && (
        <div
          className="border border-secondary rounded-lg"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-2.5">{translate('Accepted consents trend')}</h6>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Month')}</TableHead>
                <TableHead className="text-end">{translate('Count')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.accepted_consents_over_time || []).length > 0 ? (
                (showAllAcceptedMonths
                  ? data.accepted_consents_over_time
                  : data.accepted_consents_over_time.slice(-4)
                ).map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-end">{item.count}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-quaternary"
                  >
                    {translate('No data available')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {(data.accepted_consents_over_time || []).length > 4 && (
            <div className="text-center mt-1.5">
              <BaseButton
                variant="text-primary"
                size="sm"
                onClick={() => setShowAllAcceptedMonths(!showAllAcceptedMonths)}
                label={
                  showAllAcceptedMonths
                    ? translate('Show recent months')
                    : translate('Show all months')
                }
              />
            </div>
          )}
        </div>
      )}

      {selectedTable === 'revokedTrend' && (
        <div
          className="border border-secondary rounded-lg"
          style={{ padding: '16px' }}
        >
          <h6 className="mb-2.5">{translate('Revoked consents trend')}</h6>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Month')}</TableHead>
                <TableHead className="text-end">{translate('Count')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.revoked_consents_over_time.length > 0 ? (
                (showAllRevokedMonths
                  ? data.revoked_consents_over_time
                  : data.revoked_consents_over_time.slice(-4)
                ).map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-end">{item.count}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-quaternary"
                  >
                    {translate('No data available')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {data.revoked_consents_over_time.length > 4 && (
            <div className="text-center mt-1.5">
              <BaseButton
                variant="text-primary"
                size="sm"
                onClick={() => setShowAllRevokedMonths(!showAllRevokedMonths)}
                label={
                  showAllRevokedMonths
                    ? translate('Show recent months')
                    : translate('Show all months')
                }
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
