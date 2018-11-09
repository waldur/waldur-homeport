import * as React from 'react';

import Panel from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

export const parseTable = raw =>
  // Skip first and last line: header and teaser
  raw.split('\n').slice(1, -1).map(line => {
    // Split each line by space
    const [name, source, date, time, tz] = line.split(/ +/);
    const dt = [date, time, tz].join(' ');
    return {name, source, dt};
  });

export const OracleSnapshots = props => {
  let snapshots = props.report.find(section => section.header.toLowerCase() === 'snapshots');
  if (!snapshots) {
    return null;
  }
  snapshots = parseTable(snapshots.body);
  return (
    <Panel title={translate('Snapshots')}>
      <table className="table">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th>{translate('Copy of')}</th>
            <th>{translate('Creation time')}</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map((snapshot, index) => (
            <tr key={index}>
              <td>{snapshot.name}</td>
              <td>{snapshot.source}</td>
              <td>{snapshot.dt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
};
