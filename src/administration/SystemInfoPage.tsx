import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';
import { databaseStatsList, TableSize } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const DatabaseStats = ({ data }: { data: TableSize[] }) => (
  <Card className="card-bordered card-table">
    <Card.Header>
      <Card.Title>{translate('Top 10 largest database tables')}</Card.Title>
    </Card.Header>
    <Card.Body>
      <table className="table table-hover table-row-bordered align-middle mb-0">
        <thead>
          <tr>
            <th>{translate('Table')}</th>
            <th>{translate('Total size')}</th>
            <th>{translate('Internal size')}</th>
            <th>{translate('External size')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.table_name}>
              <td>{row.table_name}</td>
              <td>{formatFilesize(row.total_size, 'B')}</td>
              <td>{formatFilesize(row.data_size, 'B')}</td>
              <td>{formatFilesize(row.external_size, 'B')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card.Body>
  </Card>
);

export const SystemInfoPage = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['SystemInfoPage'],

    queryFn: () => databaseStatsList().then((r) => r.data),
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return translate('Unable to load data');
  }
  return <DatabaseStats data={data} />;
};
