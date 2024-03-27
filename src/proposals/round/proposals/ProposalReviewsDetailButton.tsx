import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';

interface ProposalReviewsDetailButtonProps {
  row: any;
}

export const ProposalReviewsDetailButton: React.FC<
  ProposalReviewsDetailButtonProps
> = ({ row }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Button onClick={() => openModal()}>{translate('Details')}</Button>
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{translate('Review details')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StringField
            label={translate('Public comment')}
            name="summary_public_comment"
            disabled={true}
            placeholder={row.summary_public_comment}
          />
          <br />
          <StringField
            label={translate('Private comment')}
            name="summary_private_comment"
            disabled={true}
            placeholder={row.summary_private_comment}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {translate('Close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
