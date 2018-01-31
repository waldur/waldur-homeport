import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import './IssueAttachmentsContainer.scss';
import { IssueAttachmentsList } from './IssueAttachmentsList';
import { getItems, getUploading, getLoading } from './selectors';
import { Attachment } from './types';

interface PureIssueAttachmentsContainerProps extends TranslateProps {
  getAttachments(): void;
  putAttachments(files: File[]): void;
  issue: { [key: string]: string };
  loading: boolean;
  attachments: Attachment[];
  uploading: number;
}

export class PureIssueAttachmentsContainer extends React.Component<PureIssueAttachmentsContainerProps> {
  state = {
    dropzoneActive: false,
  };

  dropzoneNode: any = null;

  componentWillMount() { this.props.getAttachments(); }

  onDragEnter = () => this.setState({ dropzoneActive: true });

  onDragLeave = () => this.setState({ dropzoneActive: false });

  onDrop = files => {
    this.setState({ dropzoneActive: false });
    this.props.putAttachments(files);
  }

  openDownloadModal = () => this.dropzoneNode.open();

  render() {
    const { attachments, loading, uploading, translate } = this.props;
    const { dropzoneActive } = this.state;

    return (
      <Dropzone
        disableClick={true}
        style={{ position: 'relative' }}
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        ref={node => this.dropzoneNode = node}
      >
        {dropzoneActive &&
          <div className="dropzone__overlay">
            <div className="dropzone__overlay-message">
              {translate('Drop files to attach them to the issue')}.
            </div>
          </div>
        }
        <div className="ibox">
          <div className="ibox-title attachments__title">
            <h4>{translate('Attachments')}</h4>
          </div>
          <div className="ibox-content">
            {loading ?
              <LoadingSpinner /> :
              <div className="attachments__container">
                <div className="attachments__container-message">
                  <i className="fa fa-cloud-upload" aria-hidden="true" />
                  <span>{translate('Drop files to attach, or')} <a onClick={this.openDownloadModal}>{translate('browse')}.</a></span>
                </div>
                <IssueAttachmentsList
                  attachments={attachments}
                  uploading={uploading}
                />
              </div>
            }
          </div>
        </div>
      </Dropzone>
    );
  }
}

const mapStateToProps = state => ({
  attachments: getItems(state),
  loading: getLoading(state),
  uploading: getUploading(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getAttachments: (): void => dispatch(actions.issueAttachmentsGet(ownProps.issue.url)),
  putAttachments: (files: File[]): void => dispatch(actions.issueAttachmentsPut(ownProps.issue.url, files)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  withTranslation,
);

export const IssueAttachmentsContainer = enhance(PureIssueAttachmentsContainer);

export default connectAngularComponent(IssueAttachmentsContainer, ['issue']);
