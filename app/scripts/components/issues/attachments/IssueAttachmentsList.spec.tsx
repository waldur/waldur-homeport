import { shallow } from 'enzyme';
import * as React from 'react';

import { attachment } from './fixture';
import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentLoading } from './IssueAttachmentLoading';
import { IssueAttachmentsList } from './IssueAttachmentsList';

describe('IssueAttachmentsList', () => {
  const attachments = [attachment, attachment];
  const inititalProps = {
    attachments,
    uploading: 0,
  };
  const renderWrapper = (props?) => shallow(<IssueAttachmentsList {...inititalProps} {...props} />);

  it('does not render anything if list is empty', () => {
    const wrapper = renderWrapper({ attachments: [] });
    expect(wrapper.find(IssueAttachment).length).toBe(0);
    expect(wrapper.find(IssueAttachmentLoading).length).toBe(0);
    expect(wrapper.html()).toBe(null);
  });

  it('renders item for each existing attachment', () => {
    const wrapper = renderWrapper();
    expect(wrapper.find(IssueAttachment).length).toBe(2);
  });

  it('renders loading placeholder for new attachments', () => {
    const wrapper = renderWrapper({ uploading: 2 });
    expect(wrapper.find(IssueAttachmentLoading).length).toBe(2);
  });
});
