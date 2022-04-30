import React from 'react';
import { Badge, Card, Table } from 'react-bootstrap';

import { formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

const fakeTableData = [
  {
    location: 'USA',
    status: 'Ok',
    device: 'Chrome - Windows',
    ip: '111.111.11.11',
    time: '2022-06-26T18:31:20.608307Z',
  },
  {
    location: 'United Kingdom',
    status: 'Ok',
    device: 'SSH',
    ip: '111.111.11.11',
    time: '2022-05-20T15:31:20.608307Z',
  },
  {
    location: 'Norway',
    status: 'Suspicious',
    device: 'KubeCTL',
    ip: '111.111.11.11',
    time: '2022-04-20T13:35:30.608307Z',
  },
];

const statusTagColors = {
  Ok: 'success',
  Suspicious: 'warning',
};

interface UserLoginSessionsProps {
  user: UserDetails;
}

export const UserLoginSessions: React.FC<UserLoginSessionsProps> = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Login sessions')}</h3>
        </Card.Title>
      </Card.Header>
      <Table className="table-metro login-sessions-table" responsive hover>
        <thead>
          <tr className="bg-success-light">
            <th>{translate('Location')}</th>
            <th>{translate('Status')}</th>
            <th>{translate('Device')}</th>
            <th>{translate('IP address')}</th>
            <th>{translate('Time')}</th>
          </tr>
        </thead>
        <tbody>
          {fakeTableData.map((row) => (
            <tr key={row.time}>
              <td>{row.location}</td>
              <td>
                <Badge
                  bg={statusTagColors[row.status]}
                  text={statusTagColors[row.status]}
                  className="bg-opacity-10"
                >
                  {row.status}
                </Badge>
              </td>
              <td>{row.device}</td>
              <td>{row.ip}</td>
              <td>{formatRelative(row.time)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};
