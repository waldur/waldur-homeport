import { ButtonGroup } from 'react-bootstrap';

import { OfferingCreateButton } from './OfferingCreateButton';
import { OfferingImportButton } from './OfferingImportButton';
import { OfferingsPublicListButton } from './OfferingsPublicListButton';

export const OfferingListActions = () => (
  <ButtonGroup>
    <OfferingCreateButton />
    <OfferingImportButton />
    <OfferingsPublicListButton />
  </ButtonGroup>
);
