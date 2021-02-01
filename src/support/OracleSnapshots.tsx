import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';

interface ReportRow {
  name: string;
  source: string;
  dt: string;
}

export const parseTable = (raw: string): ReportRow[] =>
  // Skip first and last line: header and teaser
  raw
    .split('\n')
    .slice(1, -1)
    .map((line) => {
      // Split each line by space
      const [name, source, date, time, tz] = line.split(/ +/);
      const dt = [date, time, tz].join(' ');
      return { name, source, dt };
    });

export const OracleSnapshots: FunctionComponent<{ report: Report }> = (
  props,
) => {
  const snapshots = props.report.find(
    (section) => section.header.toLowerCase() === 'snapshots',
  );
  if (!snapshots) {
    return null;
  }
  const snapshotRows = parseTable(snapshots.body);
  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>{translate('Name')}</th>
          <th>{translate('Copy of')}</th>
          <th>{translate('Creation time')}</th>
        </tr>
      </thead>
      <tbody>
        {snapshotRows.map((snapshot, index) => (
          <tr key={index}>
            <td>{snapshot.name}</td>
            <td>{snapshot.source}</td>
            <td>{snapshot.dt}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
