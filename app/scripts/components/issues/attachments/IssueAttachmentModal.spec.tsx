import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { PureIssueAttachmentModal } from './IssueAttachmentModal';

describe('IssueAttachmentModal', () => {
  const resolve = {
    url: 'https://example.com/media/support_attachments/panda.jpg',
  };
  const renderWrapper = (props?) => shallow(<PureIssueAttachmentModal resolve={resolve} {...props} />);

  it('renders image, title with correct link and name', () => {
    const wrapper = renderWrapper();
    const title = wrapper.find('.modal-title a');
    expect(title.prop('href')).toBe(resolve.url);
    expect(title.text()).toBe('panda.jpg');
    expect(wrapper.find('.attachment-modal__img img').prop('src')).toBe(resolve.url);
  });

  it('renders spinner on image loading', () => {
    const wrapper = renderWrapper();
    wrapper.setState({ loading: true });
    expect(wrapper.find('.attachment-modal__img img').hasClass('hidden')).toBe(true);
    expect(wrapper.find(LoadingSpinner).length).toBe(1);
  });

  it('click handler working correctly', () => {
    const closeModal = jest.fn();
    const wrapper = renderWrapper({closeModal});
    const closeModalBtn = wrapper.find('.attachment-modal__close');
    closeModalBtn.simulate('click');
    expect(closeModal).toHaveBeenCalled();
  });
});
