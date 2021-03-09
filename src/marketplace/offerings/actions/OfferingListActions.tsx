import { ButtonGroup } from 'react-bootstrap';

import { OfferingCreateButton } from './OfferingCreateButton';
import { OfferingImportButton } from './OfferingImportButton';

export const OfferingListActions = () => (
  <ButtonGroup>
    <OfferingCreateButton />
    <OfferingImportButton />
  </ButtonGroup>
);
