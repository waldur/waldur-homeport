import { shallow } from 'enzyme';
import Dropzone, { DropzoneState } from 'react-dropzone';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

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
      const dropzoneWrapper = wrapper.find(Dropzone).dive();

      expect(dropzoneWrapper.find(LoadingSpinner).length).toBe(1);
      expect(dropzoneWrapper.find(IssueAttachmentsList).length).toBe(0);
    });

    it('renders IssueAttachmentsList', () => {
      const wrapper = renderWrapper();
      const dropzoneWrapper = wrapper.find(Dropzone).dive();
      expect(dropzoneWrapper.find(IssueAttachmentsList).length).toBe(1);
    });

    it('renders dropzone overlay', () => {
      const wrapper = renderWrapper();
      const dropzoneChildrenFunc = wrapper.find(Dropzone).prop('children');

      const mockDropzoneCallbackProps: DropzoneState = {
        isDragActive: false,
        acceptedFiles: [],
        open: jest.fn(),
        fileRejections: [],
        inputRef: null,
        isDragAccept: true,
        isDragReject: false,
        isFileDialogActive: false,
        isFocused: true,
        rootRef: null,
        getRootProps: (props) => props,
        getInputProps: (props) => props,
      };

      let content = shallow(dropzoneChildrenFunc(mockDropzoneCallbackProps));
      expect(content.find('.dropzone__overlay').length).toBe(0);

      content = shallow(
        dropzoneChildrenFunc({
          ...mockDropzoneCallbackProps,
          isDragActive: true,
        }),
      );
      expect(content.find('.dropzone__overlay').length).toBe(1);
    });
  });
});
