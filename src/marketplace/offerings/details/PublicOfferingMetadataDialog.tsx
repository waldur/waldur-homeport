import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const PublicOfferingMetadataDialog = ({ resolve }) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Offering metadata')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{resolve}</Modal.Body>
    </>
  );
};
