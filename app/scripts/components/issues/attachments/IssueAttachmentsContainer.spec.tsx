import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { PureIssueAttachmentsContainer } from './IssueAttachmentsContainer';
import { IssueAttachmentsList } from './IssueAttachmentsList';
import { Attachment } from './types';

describe('IssueAttachmentsContainer', () => {
  const attachment: Attachment = {
    created: '2018-01-11T19:41:50.451396Z',
    file: 'https://example.com/media/support_attachments/panda.jpg',
    issue: 'https://example.com/api/support-issues/784fd0b3502849f6bd613d574e06b1e4/',
    issue_key: 'WAL-164',
    url: 'https://example.com/api/support-attachments/30a44649ee2d4a67ba1f17938a8a5f6e/',
    uuid: '30a44649ee2d4a67ba1f17938a8a5f6e',
  };
  const issue = {
    url: 'url',
  };
  const initialProps = {
    issue,
    loading: false,
    attachments: [attachment],
    uploading: 0,
    getAttachments: () => undefined,
    translate,
  };
  const renderWrapper = (props?) => shallow(<PureIssueAttachmentsContainer {...initialProps} {...props} />);

  describe('IssueAttachmentsContainer', () => {

    it('invokes getAttachments function', () => {
      const getAttachments = jest.fn();
      renderWrapper({getAttachments});
      expect(getAttachments).toBeCalled();
    });

    it('renders loading spinner on loading', () => {
      const wrapper = renderWrapper({ loading: true });
      expect(wrapper.find(LoadingSpinner).length).toBe(1);
      expect(wrapper.find(IssueAttachmentsList).length).toBe(0);
    });

    it('renders IssueAttachmentsList', () => {
      const wrapper = renderWrapper();
      expect(wrapper.find(IssueAttachmentsList).length).toBe(1);
    });

    it('renders dropzone overlay', () => {
      const wrapper = renderWrapper();
      expect(wrapper.find('.dropzone__overlay').length).toBe(0);
      wrapper.setState({ dropzoneActive: true });
      expect(wrapper.find('.dropzone__overlay').length).toBe(1);
    });
  });
});
