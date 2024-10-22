import { Trash, Warning } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { isImage } from '../comments/utils';

import * as actions from './actions';
import './IssueAttachment.scss';
import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';
import { getIsDeleting } from './selectors';
import { Attachment } from './types';
import * as utils from './utils';

interface IssueAttachmentProps {
  attachment: Attachment;
}

export const IssueAttachment: FunctionComponent<IssueAttachmentProps> = ({
  attachment,
}) => {
  const isDeleting = useSelector((state) =>
    getIsDeleting(state, { attachment }),
  );
  const dispatch = useDispatch();
  const deleteAttachment = () =>
    dispatch(actions.issueAttachmentsDelete(attachment.uuid));
  const openModal = () =>
    dispatch(utils.openAttachmentModal(attachment.file, attachment.file_name));

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
            {isImage(attachment.mime_type) ? (
              <button onClick={openModal}>
                <ImageFetcher
                  url={attachment.file}
                  name={attachment.file_name}
                />
              </button>
            ) : (
              <FileDownloader
                url={attachment.file}
                name={attachment.file_name}
              />
            )}
          </div>
          <div className="attachment-item__description">
            <div className="attachment-item__description-name">
              {attachment.file_name}
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
