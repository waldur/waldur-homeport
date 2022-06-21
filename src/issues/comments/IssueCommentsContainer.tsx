import { Component } from 'react';
import { Card } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
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

  onDrop = (files) => {
    this.setState({ dropzoneActive: false });
    this.props.putAttachments(files);
  };

  openDownloadModal = () => this.dropzoneNode.open();

  render() {
    const { comments, loading, issue, erred } = this.props;
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
        ref={(node) => (this.dropzoneNode = node)}
      >
        {dropzoneActive && (
          <LoadingOverlay
            className="loading-overlay_border_dashed"
            message={translate('Drop files to attach them to the issue.')}
          />
        )}
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
