import { render } from 'enzyme';
import * as React from 'react';

import { QuotaPie } from './QuotaPie';

describe('Quota pie', () => {
  it('renders SVG chart', () => {
    expect(render(<QuotaPie value={0.33} />).html()).toMatchSnapshot();
  });
});
