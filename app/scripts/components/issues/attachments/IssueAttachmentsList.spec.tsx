import { shallow } from 'enzyme';
import * as React from 'react';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentLoading } from './IssueAttachmentLoading';
import { IssueAttachmentsList } from './IssueAttachmentsList';

describe('IssueAttachmentsList', () => {
  const attachments = [
    {
      created: '2018-01-11T19:41:50.451396Z',
      file: 'https://example.com/media/support_attachments/panda.jpg',
      issue: 'https://example.com/api/support-issues/784fd0b3502849f6bd613d574e06b1e4/',
      issue_key: 'WAL-164',
      url: 'https://example.com/api/support-attachments/30a44649ee2d4a67ba1f17938a8a5f6e/',
      uuid: '30a44649ee2d4a67ba1f17938a8a5f6e',
    },
    {
      created: '2018-01-11T19:41:50.451396Z',
      file: 'https://example.com/media/support_attachments/panda.jpg',
      issue: 'https://example.com/api/support-issues/784fd0b3502849f6bd613d574e06b1e4/',
      issue_key: 'WAL-164',
      url: 'https://example.com/api/support-attachments/30a44649ee2d4a67ba1f17938a8a5f6e/',
      uuid: '30a44649ee2d4a67ba1f17938a8a5g67',
    },
  ];
  const inititalProps = {
    attachments,
    uploading: 0,
  };
  const renderWrapper = (props?) => shallow(<IssueAttachmentsList {...inititalProps} {...props} />);

  it('renders any IssueAttachment or IssueAttachmentLoading components if no data', () => {
    const wrapper = renderWrapper({ attachments: [] });
    expect(wrapper.find(IssueAttachment).length).toBe(0);
    expect(wrapper.find(IssueAttachmentLoading).length).toBe(0);
  });

  it('renders IssueAttachment', () => {
    const wrapper = renderWrapper();
    expect(wrapper.find(IssueAttachment).length).toBe(2);
  });

  it('renders attachmentLoading', () => {
    const wrapper = renderWrapper({ uploading: 2 });
    expect(wrapper.find(IssueAttachmentLoading).length).toBe(2);
  });
});
