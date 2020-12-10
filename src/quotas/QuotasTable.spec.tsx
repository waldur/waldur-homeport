import { render } from 'enzyme';

import { QuotasTable } from './QuotasTable';

const quotas = require('./QuotasTable.fixture.json');

const renderComponent = (resource) => {
  const wrapper = render(<QuotasTable resource={resource} />);
  return wrapper.html();
};

describe('QuotasTable', () => {
  it('renders table for quotas', () => {
    const html = renderComponent({ quotas });
    expect(html).toMatchSnapshot();
  });
});
