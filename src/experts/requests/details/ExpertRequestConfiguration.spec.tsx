import { render } from 'enzyme';
import * as React from 'react';

import { ExpertRequestConfiguration } from './ExpertRequestConfiguration';

const renderComponent = model => {
  const config = {
    order: ['milestones'],
    options: {
      milestones: {
        type: 'html_text',
        label: 'Milestones',
      },
    },
  };
  const wrapper = render(
    <ExpertRequestConfiguration
      model={model}
      config={config}
    />
  );
  return wrapper.html();
};

describe('ExpertRequestConfiguration', () => {
  it('renders HTML field as is', () => {
    const html = renderComponent({
      milestones: '<ul><li>Deploy virtual machine</li></ul>',
    });
    expect(html).toMatchSnapshot();
  });

  it('renders placeholder if value if missing', () => {
    const html = renderComponent({milestones: undefined});
    expect(html).toMatchSnapshot();
  });
});
