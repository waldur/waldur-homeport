import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import type { TableSize } from './api';

interface DatabaseTableStatsProps {
  data: TableSize[];
}

export const DatabaseTableStats: FC<DatabaseTableStatsProps> = ({ data }) => {
  return (
    <AccordionCard
      id="database-table-stats"
      title={translate('Largest tables')}
      subtitle={translate('Top {count} tables by size', { count: data.length })}
      defaultOpen
      className="mb-5"
    >
      <table className="table table-hover table-row-bordered align-middle mb-0">
        <thead>
          <tr>
            <th>{translate('Table')}</th>
            <th className="text-end">{translate('Total size')}</th>
            <th className="text-end">{translate('Data size')}</th>
            <th className="text-end">{translate('Index size')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.table_name}>
              <td>
                <code>{row.table_name}</code>
              </td>
              <td className="text-end">
                {formatFilesize(row.total_size, 'B')}
              </td>
              <td className="text-end">{formatFilesize(row.data_size, 'B')}</td>
              <td className="text-end">
                {formatFilesize(row.external_size, 'B')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccordionCard>
  );
};
