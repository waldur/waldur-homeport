import { shallow } from 'enzyme';
import Dropzone, { DropzoneState } from 'react-dropzone';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';

import { comment, issue } from './fixture';
import { PureIssueCommentsContainer } from './IssueCommentsContainer';
import { IssueCommentsList } from './IssueCommentsList';

const initialProps = {
  comments: [comment],
  issue,
  fetchComments: () => null,
  setIssue: (x) => x,
};
const renderWrapper = (props?) =>
  shallow(<PureIssueCommentsContainer {...initialProps} {...props} />);

const getLoadingSpinner = (container) => container.find(LoadingSpinner);
const getIssueCommentsList = (container) => container.find(IssueCommentsList);
const getLoadingOverlay = (container) => container.find(LoadingOverlay);

describe('IssueCommentsContainer', () => {
  it('renders LoadingOverlay', () => {
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
    expect(getLoadingOverlay(content).length).toBe(0);
    content = shallow(
      dropzoneChildrenFunc({
        ...mockDropzoneCallbackProps,
        isDragActive: true,
      }),
    );
    expect(getLoadingOverlay(content).length).toBe(1);
  });

  it('renders LoadingSpinner on loading', () => {
    const wrapper = renderWrapper({ loading: true });
    const dropzoneWrapper = wrapper.find(Dropzone).dive();
    expect(getLoadingSpinner(dropzoneWrapper).length).toBe(1);
    expect(getIssueCommentsList(dropzoneWrapper).length).toBe(0);
  });
});
