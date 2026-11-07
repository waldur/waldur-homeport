import { FC } from 'react';

import {
  AccordionCard,
  Code,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

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
      <Table density="compact" className="align-middle mb-0">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('Table')}</TableHead>
            <TableHead className="text-end">
              {translate('Total size')}
            </TableHead>
            <TableHead className="text-end">{translate('Data size')}</TableHead>
            <TableHead className="text-end">
              {translate('Index size')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.table_name}>
              <TableCell>
                <Code>{row.table_name}</Code>
              </TableCell>
              <TableCell className="text-end">
                {formatFilesize(row.total_size, 'B')}
              </TableCell>
              <TableCell className="text-end">
                {formatFilesize(row.data_size, 'B')}
              </TableCell>
              <TableCell className="text-end">
                {formatFilesize(row.external_size, 'B')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AccordionCard>
  );
};
