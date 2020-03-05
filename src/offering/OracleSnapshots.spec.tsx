import { render } from 'enzyme';
import * as React from 'react';

import { OracleSnapshots, parseTable } from './OracleSnapshots';

const renderComponent = report => {
  const wrapper = render(<OracleSnapshots report={report} />);
  return wrapper.html();
};

describe('OracleSnapshots', () => {
  it('renders HTML table for Oracle snapshots', () => {
    const html = renderComponent(require('./OracleSnapshots.fixture.json'));
    expect(html).toMatchSnapshot();
  });

  it('correctly parses table into rows', () => {
    const raw =
      'Name                    CopyOf           CreationTime           \n' +
      'ora-ora-db-asm02.180727 ora-ora-db-asm02 2018-07-27 23:30:00 GST\n' +
      'ora-ora-db-sys.180727   ora-ora-db-sys   2018-07-27 23:30:00 GST\n' +
      '----------------------------------------------------------------';
    const table = parseTable(raw);
    expect(table).toEqual([
      {
        name: 'ora-ora-db-asm02.180727',
        source: 'ora-ora-db-asm02',
        dt: '2018-07-27 23:30:00 GST',
      },
      {
        name: 'ora-ora-db-sys.180727',
        source: 'ora-ora-db-sys',
        dt: '2018-07-27 23:30:00 GST',
      },
    ]);
  });
});
