import { shallow } from 'enzyme';
import * as React from 'react';

import { PureDownloadLink } from './component';

const setupFixture = (props?) => {
  const mockDownload = jest.fn();
  const mockReset = jest.fn();
  const wrapper = shallow(
    <PureDownloadLink
      filename="file.pdf"
      label="Download report"
      url="http://example.com/file.pdf"
      onDownload={mockDownload}
      onReset={mockReset}
      loading={false}
      loaded={false}
      erred={false}
      {...props}
    />,
  );
  return {
    wrapper,
    mockDownload,
    mockReset,
  };
};

describe('DownloadLink component', () => {
  it('does not render any indicators by default', () => {
    const { wrapper } = setupFixture();
    expect(wrapper.find('.text-info').length).toBe(0);
    expect(wrapper.find('.text-success').length).toBe(0);
    expect(wrapper.find('.text-danger').length).toBe(0);
  });

  it('renders spinner if file is loading', () => {
    const { wrapper } = setupFixture({ loading: true });
    expect(wrapper.find('.text-info').length).toBe(1);
  });

  it('renders success indicator if file is loaded', () => {
    const { wrapper } = setupFixture({ loaded: true });
    expect(wrapper.find('.text-success').length).toBe(1);
  });

  it('renders warning if loading failed', () => {
    const { wrapper } = setupFixture({ erred: true });
    expect(wrapper.find('.text-danger').length).toBe(1);
  });

  it('starts downloading when link is clicked', () => {
    const { wrapper, mockDownload } = setupFixture();
    wrapper.find('a').simulate('click');
    expect(mockDownload).toHaveBeenCalled();
  });

  it('resets state when link is destroyed', () => {
    const { wrapper, mockReset } = setupFixture();
    wrapper.unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});
