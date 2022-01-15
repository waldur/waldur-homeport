import { FunctionComponent } from 'react';
import { ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';

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
    <ModalHeader onClick={onReturn} style={{ cursor: 'pointer' }}>
      <ModalTitle>
        <i className="fa fa-arrow-left"></i> {translate('Images')}
      </ModalTitle>
    </ModalHeader>
    <ModalBody>
      <CreateImageButton offering={offering} />
      <OfferingImagesList />
    </ModalBody>
  </>
);
