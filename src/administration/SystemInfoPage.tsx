import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const getDatabaseStats = () =>
  get('/database-stats/').then((response) => response.data);

const DatabaseStats = ({ data }) => (
  <Card>
    <Card.Header>
      <Card.Title>{translate('Top 10 largest database tables')}</Card.Title>
    </Card.Header>
    <Card.Body>
      <table className="table table-hover no-margins">
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
  const { isLoading, error, data } = useQuery(['SystemInfoPage'], () =>
    getDatabaseStats(),
  );
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return translate('Unable to load data');
  }
  return <DatabaseStats data={data} />;
};
