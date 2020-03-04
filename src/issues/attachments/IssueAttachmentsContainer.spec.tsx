import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { attachment } from './fixture';
import { PureIssueAttachmentsContainer } from './IssueAttachmentsContainer';
import { IssueAttachmentsList } from './IssueAttachmentsList';

describe('IssueAttachmentsContainer', () => {
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
  const renderWrapper = (props?) =>
    shallow(<PureIssueAttachmentsContainer {...initialProps} {...props} />);

  describe('IssueAttachmentsContainer', () => {
    it('invokes getAttachments function', () => {
      const getAttachments = jest.fn();
      renderWrapper({ getAttachments });
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
