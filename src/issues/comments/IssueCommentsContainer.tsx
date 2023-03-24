import { Component } from 'react';
import { Card } from 'react-bootstrap';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { issueAttachmentsPut } from '@waldur/issues/attachments/actions';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { IssueReload } from '@waldur/issues/IssueReload';
import { RootState } from '@waldur/store/reducers';

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

interface PureIssueCommentsContainerProps {
  comments: Comment[];
  issue: Issue;
  loading: boolean;
  erred: boolean;
  fetchComments(): void;
  putAttachments(files: File[]): void;
  setIssue(issue: Issue): void;
  renderHeader: boolean;
}

export class PureIssueCommentsContainer extends Component<PureIssueCommentsContainerProps> {
  static defaultProps = {
    renderHeader: true,
  };

  dropzoneNode: DropzoneRef;

  componentDidMount() {
    const { fetchComments, setIssue, issue } = this.props;

    fetchComments();
    setIssue(issue);
  }

  onDrop = (files) => {
    this.props.putAttachments(files);
  };

  openDownloadModal = () => this.dropzoneNode.open();

  render() {
    const { comments, loading, issue, erred } = this.props;
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
        noClick
        onDrop={this.onDrop}
        ref={(node) => (this.dropzoneNode = node)}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{ position: 'relative' }}
          >
            {isDragActive && (
              <LoadingOverlay
                className="loading-overlay_border_dashed"
                message={translate('Drop files to attach them to the issue.')}
              />
            )}
            <input {...getInputProps()} />
            {this.props.renderHeader ? (
              <Card>
                <div className="card-header content-between-center">
                  <h4>{translate('Comments')}</h4>
                  <div>
                    <IssueReload issueUrl={issue.url} />
                  </div>
                </div>
                <Card.Body>{body}</Card.Body>
              </Card>
            ) : (
              body
            )}
          </div>
        )}
      </Dropzone>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
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

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const IssueCommentsContainer = enhance(PureIssueCommentsContainer);
