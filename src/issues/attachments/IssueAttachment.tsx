import { Trash, Warning } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { isImage } from '../comments/utils';

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
  if (isImage(attachment.mime_type)) {
    return (
      <img
        src={attachment.file}
        onClick={openModalHandler}
        alt="thumb"
        aria-hidden="true"
      />
    );
  } else {
    return (
      <a href={attachment.file} download="true">
        <i className="fa fa-file" aria-hidden="true" />
      </a>
    );
  }
};

export const PureIssueAttachment: FunctionComponent<
  PureIssueAttachmentProps
> = (props) => {
  const { attachment, isDeleting, deleteAttachment, openModal } = props;

  return (
    <div className="attachment-item">
      {isDeleting && (
        <div className="attachment-item__overlay">
          <LoadingSpinner />
        </div>
      )}
      {attachment.file ? (
        <>
          <div className="attachment-item__thumb">
            {getThumbnail(attachment, openModal)}
          </div>
          <div className="attachment-item__description">
            <div className="attachment-item__description-name">
              <a href={attachment.file} download="true">
                {attachment.file_name}
              </a>
              <button
                className="attachment-item__delete text-btn"
                type="button"
                onClick={deleteAttachment}
              >
                <span className="svg-icon svg-icon-2">
                  <Trash />
                </span>
              </button>
            </div>
            <div className="attachment-item__description-info">
              <div className="attachment-item__description-date">
                {formatDateTime(attachment.created)}
              </div>
              <div className="attachment-item__description-size">
                {formatFilesize(attachment.file_size, 'B')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="attachment-item__thumb">
            <Warning />
          </div>
          <div className="attachment-item__description">
            <div className="attachment-item__description-name">
              {translate('Attachment is broken.')}
            </div>
          </div>
        </>
      )}
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
      dispatch(
        utils.openAttachmentModal(
          ownProps.attachment.file,
          ownProps.attachment.file_name,
        ),
      ),
  };
};

export const IssueAttachment = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PureIssueAttachment);
