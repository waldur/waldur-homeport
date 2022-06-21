import { Component } from 'react';
import { Card } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { IssueReload } from '@waldur/issues/IssueReload';
import { RootState } from '@waldur/store/reducers';

import * as actions from './actions';
import './IssueAttachmentsContainer.scss';
import { IssueAttachmentsList } from './IssueAttachmentsList';
import { getAttachments, getUploading, getIsLoading } from './selectors';
import { Attachment } from './types';

interface PureIssueAttachmentsContainerProps {
  getAttachments(): void;
  putAttachments(files: File[]): void;
  issue: { [key: string]: string };
  loading: boolean;
  attachments: Attachment[];
  uploading: number;
}

export class PureIssueAttachmentsContainer extends Component<PureIssueAttachmentsContainerProps> {
  state = {
    dropzoneActive: false,
  };

  dropzoneNode: Dropzone;

  componentDidMount() {
    this.props.getAttachments();
  }

  onDragEnter = () => this.setState({ dropzoneActive: true });

  onDragLeave = () => this.setState({ dropzoneActive: false });

  onDrop = (files) => {
    this.setState({ dropzoneActive: false });
    this.props.putAttachments(files);
  };

  openDownloadModal = () => this.dropzoneNode.open();

  render() {
    const { attachments, loading, uploading, issue } = this.props;
    const { dropzoneActive } = this.state;

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
          <div className="dropzone__overlay">
            <div className="dropzone__overlay-message">
              {translate('Drop files to attach them to the issue.')}
            </div>
          </div>
        )}
        <Card>
          <Card.Header>
            <Card.Title>
              <h3>{translate('Attachments')}</h3>
            </Card.Title>
            <div className="card-toolbar">
              <IssueReload issueUrl={issue.url} />
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="attachments__container">
                <div className="attachments__container-message">
                  <i className="fa fa-cloud-upload" aria-hidden="true" />
                  <span>
                    {translate('Drop files to attach, or')}{' '}
                    <a onClick={this.openDownloadModal}>
                      {translate('browse')}.
                    </a>
                  </span>
                </div>
                <IssueAttachmentsList
                  attachments={attachments}
                  uploading={uploading}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Dropzone>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  attachments: getAttachments(state),
  loading: getIsLoading(state),
  uploading: getUploading(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getAttachments: (): void =>
    dispatch(actions.issueAttachmentsGet(ownProps.issue.url)),
  putAttachments: (files: File[]): void =>
    dispatch(actions.issueAttachmentsPut(ownProps.issue.url, files)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const IssueAttachmentsContainer = enhance(PureIssueAttachmentsContainer);
