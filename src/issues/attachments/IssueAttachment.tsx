import * as React from 'react';
import { connect } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';

import * as actions from './actions';
import './IssueAttachment.scss';
import { getIsDeleting } from './selectors';
import { Attachment } from './types';
import * as utils from './utils';

interface PureIssueAttachmentProps {
  attachment: Attachment;
  isDeleting: boolean;
  deleteAttachment(): void;
  openModal(): void;
}

const getThumbnail = (attachment: Attachment, openModalHandler) => {
  if (attachment.file.match(/\.(png|jpg|jpeg|gif)/g)) {
    return <img src={attachment.file} onClick={openModalHandler} />;
  } else {
    return (
      <a href={attachment.file} download="true">
        <i className="fa fa-file" aria-hidden="true" />
      </a>
    );
  }
};

export const PureIssueAttachment = (props: PureIssueAttachmentProps) => {
  const { attachment, isDeleting, deleteAttachment, openModal } = props;

  return (
    <div className="attachment-item">
      {isDeleting && (
        <div className="attachment-item__overlay">
          <LoadingSpinner />
        </div>
      )}
      <div className="attachment-item__thumb">
        {getThumbnail(attachment, openModal)}
      </div>
      <div className="attachment-item__description">
        <div className="attachment-item__description-name">
          <a href={attachment.file} download="true">
            {utils.getFileName(attachment.file)}
          </a>
          <div className="attachment-item__delete" onClick={deleteAttachment}>
            <i className="fa fa-trash" aria-hidden="true" />
          </div>
        </div>
        <div className="attachment-item__description-info">
          <div className="attachment-item__description-date">
            {formatDateTime(new Date(attachment.created))}
          </div>
          <div className="attachment-item__description-size">
            {formatFilesize(attachment.file_size, 'B')}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  isDeleting: getIsDeleting(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    deleteAttachment: (): void =>
      dispatch(actions.issueAttachmentsDelete(ownProps.attachment.uuid)),
    openModal: (): void =>
      dispatch(utils.openAttachmentModal(ownProps.attachment.file)),
  };
};

export const IssueAttachment = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PureIssueAttachment);
