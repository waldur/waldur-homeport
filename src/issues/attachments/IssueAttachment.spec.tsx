import { shallow } from 'enzyme';
import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { attachment } from './fixture';
import { PureIssueAttachment } from './IssueAttachment';

describe('IssueAttachment', () => {
  const inititalProps = {
    attachment,
    isDeleting: false,
    deleteAttachment: () => undefined,
    openModal: () => undefined,
  };
  const renderWrapper = (props?) =>
    shallow(<PureIssueAttachment {...inititalProps} {...props} />);

  it('renders thumbnail', () => {
    const wrapper = renderWrapper({ attachment });
    expect(wrapper.find('.attachment-item__thumb img').prop('src')).toBe(
      attachment.file,
    );
  });

  it('renders file icon', () => {
    const currAttachment = {
      ...attachment,
      file: 'file.txt',
    };
    const wrapper = renderWrapper({ attachment: currAttachment });
    expect(wrapper.find('.attachment-item__thumb .fa.fa-file').length).toBe(1);
    expect(wrapper.find('.attachment-item__thumb a').prop('href')).toBe(
      'file.txt',
    );
  });

  it('renders description', () => {
    const wrapper = renderWrapper();
    const anchor = wrapper.find('.attachment-item__description-name a');
    expect(anchor.text()).toBe('panda.jpg');
    expect(anchor.prop('href')).toBe(attachment.file);
    expect(wrapper.find('.attachment-item__description-date').text()).toBe(
      formatDateTime(attachment.created),
    );
    expect(wrapper.find('.attachment-item__description-size').text()).toBe(
      '62.6 KB',
    );
  });

  it('renders deleting overlay', () => {
    const wrapper = renderWrapper({ attachment, isDeleting: true });
    expect(wrapper.find('.attachment-item__overlay').length).toBe(1);
    expect(wrapper.find(LoadingSpinner).length).toBe(1);
  });

  it('invokes deleteAttachment on click', () => {
    const deleteAttachment = jest.fn();
    const wrapper = renderWrapper({ attachment, deleteAttachment });
    const deleteBtn = wrapper.find('.attachment-item__delete');
    deleteBtn.simulate('click');
    expect(deleteAttachment).toBeCalled();
  });

  it('opens modal dialog when user clicks on image thumbnail', () => {
    const openModal = jest.fn();
    const wrapper = renderWrapper({ openModal });
    const thumbnail = wrapper.find('.attachment-item__thumb img');
    thumbnail.simulate('click');
    expect(openModal).toBeCalled();
  });
});
