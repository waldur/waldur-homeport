import { FC, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { OpenStackInstanceAggregate } from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';
import { renderFieldOrDash } from '@waldur/table/utils';

interface AggregateTableProps {
  data: OpenStackInstanceAggregate[];
}

export const AggregateTable: FC<AggregateTableProps> = ({ data }) => {
  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Group'),
        translate('Instances'),
        translate('Total cores'),
        translate('Total RAM'),
        translate('Total disk'),
        translate('Total volume size'),
        translate('Floating IPs'),
      ],
      data: (data || []).map((row) => [
        renderFieldOrDash(row.group_label || row.group_key),
        row.instance_count,
        row.total_cores,
        formatFilesize(row.total_ram_mb),
        formatFilesize(row.total_disk_mb),
        formatFilesize(row.total_volume_size_mb),
        row.total_floating_ips,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard title={translate('Details')} getExportData={getExportData}>
      {() => (
        <div className="table-responsive">
          <Table className="table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3 p-0 m-0 text-start text-gray-600">
            <thead>
              <tr className="fw-bold text-muted text-uppercase fs-7 gs-0">
                <th>{translate('Group')}</th>
                <th>{translate('Instances')}</th>
                <th>{translate('Total cores')}</th>
                <th>{translate('Total RAM')}</th>
                <th>{translate('Total disk')}</th>
                <th>{translate('Total volume size')}</th>
                <th>{translate('Floating IPs')}</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((row) => (
                <tr key={row.group_key}>
                  <td>{renderFieldOrDash(row.group_label || row.group_key)}</td>
                  <td>{row.instance_count}</td>
                  <td>{row.total_cores}</td>
                  <td>{formatFilesize(row.total_ram_mb)}</td>
                  <td>{formatFilesize(row.total_disk_mb)}</td>
                  <td>{formatFilesize(row.total_volume_size_mb)}</td>
                  <td>{row.total_floating_ips}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </ChartCard>
  );
};
