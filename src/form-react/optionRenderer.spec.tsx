import { shallow } from 'enzyme';

import { Tooltip } from '@waldur/core/Tooltip';

import { optionRenderer } from './optionRenderer';

const option = {
  icon_url: 'icon.png',
  name: 'OpenStack instance',
  description: 'Virtual machine',
};

describe('optionRenderer', () => {
  it('renders image and label', () => {
    const renderer = optionRenderer({
      iconKey: 'icon_url',
      labelKey: 'name',
    });
    const wrapper = shallow(renderer(option));
    expect(wrapper.find('img').first().prop('src')).toBe(option.icon_url);
    expect(wrapper.find('div').first().text()).toBe(option.name);
  });

  it('renders tooltip', () => {
    const renderer = optionRenderer({
      iconKey: 'icon_url',
      labelKey: 'name',
      tooltipKey: 'description',
    });
    const wrapper = shallow(renderer(option));
    expect(wrapper.find(Tooltip).first().prop('label')).toBe(option.description);
  });

  it('renders image specified as function', () => {
    const renderer = optionRenderer({
      iconKey: resource => `http://example.com/${resource.icon_url}`,
      labelKey: 'name',
      tooltipKey: 'description',
    });
    const wrapper = shallow(renderer(option));
    expect(wrapper.find('img').first().prop('src')).toBe('http://example.com/icon.png');
  });
});
