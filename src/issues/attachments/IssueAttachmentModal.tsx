import { X } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { closeModalDialog } from '@waldur/modal/actions';

import './IssueAttachmentModal.scss';
import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';

export const IssueAttachmentModal = ({
  resolve: { url, name },
}: {
  resolve: {
    url: string;
    name: string;
  };
}) => {
  const dispatch = useDispatch();
  const closeModal = () => dispatch(closeModalDialog());

  return (
    <div className="attachment-modal">
      <button className="attachment-modal__close text-btn" onClick={closeModal}>
        <X />
      </button>
      <div className="modal-header">
        <div className="modal-title">
          <h3>
            <FileDownloader url={url} name={name} />
          </h3>
        </div>
      </div>
      <div className="modal-body attachment-modal__img">
        <ImageFetcher url={url} name={name} />
      </div>
    </div>
  );
};
