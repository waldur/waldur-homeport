import { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { CreateImageButton } from '../images/CreateImageButton';
import { OfferingImagesList } from '../images/OfferingImagesList';

interface PageImagesProps {
  offering: Offering;
  onReturn: () => void;
}

export const PageImages: FunctionComponent<PageImagesProps> = ({
  onReturn,
  offering,
}) => (
  <>
    <Modal.Header onClick={onReturn} style={{ cursor: 'pointer' }}>
      <Modal.Title>
        <i className="fa fa-arrow-left"></i> {translate('Images')}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <CreateImageButton offering={offering} />
      <OfferingImagesList />
    </Modal.Body>
  </>
);
