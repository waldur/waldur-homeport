import { render } from 'enzyme';
import * as React from 'react';

import { OracleSnapshots } from './OracleSnapshots';

const renderComponent = report => {
  const wrapper = render(
    <OracleSnapshots report={report} />
  );
  return wrapper.html();
};

describe('OracleSnapshots', () => {
  it('renders HTML table for Oracle snapshots', () => {
    const html = renderComponent(require('./OracleSnapshots.fixture.json'));
    expect(html).toMatchSnapshot();
  });
});
