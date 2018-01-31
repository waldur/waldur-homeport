import { shallow } from 'enzyme';
import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { PureIssueAttachment } from './IssueAttachment';
import { Attachment } from './types';

describe('IssueAttachment', () => {
  const attachment: Attachment = {
    created: '2018-01-11T19:41:50.451396Z',
    file_size: 64145,
    file: 'https://example.com/media/support_attachments/panda.jpg',
    issue: 'https://example.com/api/support-issues/784fd0b3502849f6bd613d574e06b1e4/',
    issue_key: 'WAL-164',
    url: 'https://example.com/api/support-attachments/30a44649ee2d4a67ba1f17938a8a5f6e/',
    uuid: '30a44649ee2d4a67ba1f17938a8a5f6e',
  };
  const inititalProps = {
    attachment,
    isDeleting: false,
    deleteAttachment: () => undefined,
    openModal: () => undefined,
  };
  const renderWrapper = (props?) => shallow(<PureIssueAttachment {...inititalProps} {...props} />);

  it('renders thumbnail', () => {
    const wrapper = renderWrapper({ attachment });
    expect(wrapper.find('.attachment-item__thumb img').prop('src')).toBe(attachment.file);
  });

  it('renders file icon', () => {
    const currAttachment = {
      ...attachment,
      file: 'file.txt',
    };
    const wrapper = renderWrapper({ attachment: currAttachment });
    expect(wrapper.find('.attachment-item__thumb .fa.fa-file').length).toBe(1);
    expect(wrapper.find('.attachment-item__thumb a').prop('href')).toBe('file.txt');
  });

  it('renders description', () => {
    const wrapper = renderWrapper();
    const anchor = wrapper.find('.attachment-item__description-name a');
    expect(anchor.text()).toBe('panda.jpg');
    expect(anchor.prop('href')).toBe(attachment.file);
    expect(wrapper.find('.attachment-item__description-date').text()).toBe(formatDateTime(attachment.created));
    expect(wrapper.find('.attachment-item__description-size').text()).toBe('62.6 KB');
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
