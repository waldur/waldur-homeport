import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { issueAttachmentsPut } from '@waldur/issues/attachments/actions';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { IssueReload } from '@waldur/issues/IssueReload';

import * as actions from './actions';
import * as constants from './constants';
import { IssueCommentsFormMainContainer } from './IssueCommentsFormMainContainer';
import { IssueCommentsList } from './IssueCommentsList';
import {
  getCommentsSelector,
  getIsLoading,
  getCommentsGetErred,
} from './selectors';
import { Comment, Issue } from './types';

interface PureIssueCommentsContainerProps extends TranslateProps {
  comments: Comment[];
  issue: Issue;
  loading: boolean;
  erred: boolean;
  fetchComments(): void;
  putAttachments(files: File[]): void;
  setIssue(issue: Issue): void;
  renderHeader: boolean;
}

export class PureIssueCommentsContainer extends React.Component<
  PureIssueCommentsContainerProps
> {
  state = {
    dropzoneActive: false,
  };

  static defaultProps = {
    renderHeader: true,
  };

  dropzoneNode: Dropzone;

  componentDidMount() {
    const { fetchComments, setIssue, issue } = this.props;

    fetchComments();
    setIssue(issue);
  }

  onDragEnter = () => this.setState({ dropzoneActive: true });

  onDragLeave = () => this.setState({ dropzoneActive: false });

  onDrop = files => {
    this.setState({ dropzoneActive: false });
    this.props.putAttachments(files);
  };

  openDownloadModal = () => this.dropzoneNode.open();

  render() {
    const { comments, loading, issue, translate, erred } = this.props;
    const { dropzoneActive } = this.state;
    const body = loading ? (
      <LoadingSpinner />
    ) : (
      <>
        <IssueCommentsList comments={comments} />
        <IssueCommentsFormMainContainer
          formId={constants.MAIN_FORM_ID}
          erred={erred}
        />
      </>
    );

    return (
      <Dropzone
        disableClick={true}
        style={{ position: 'relative' }}
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        ref={node => (this.dropzoneNode = node)}
      >
        {dropzoneActive && (
          <LoadingOverlay
            className="loading-overlay_border_dashed"
            message={translate('Drop files to attach them to the issue.')}
          />
        )}
        {this.props.renderHeader ? (
          <div className="ibox">
            <div className="ibox-title content-between-center">
              <h4>{translate('Comments')}</h4>
              <div>
                <IssueReload issueUrl={issue.url} />
              </div>
            </div>
            <div className="ibox-content">{body}</div>
          </div>
        ) : (
          body
        )}
      </Dropzone>
    );
  }
}

const mapStateToProps = state => ({
  comments: getCommentsSelector(state),
  loading: getIsLoading(state),
  erred: getCommentsGetErred(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  putAttachments: (files: File[]): void =>
    dispatch(issueAttachmentsPut(ownProps.issue.url, files)),
  fetchComments: (): void =>
    dispatch(actions.issueCommentsGet(ownProps.issue.url)),
  setIssue: (issue: Issue): void =>
    dispatch(actions.issueCommentsIssueSet(issue)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const IssueCommentsContainer = enhance(PureIssueCommentsContainer);
