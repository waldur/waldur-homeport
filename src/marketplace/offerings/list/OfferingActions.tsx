import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DeleteOfferingButton } from './DeleteOfferingButton';
import { EditOfferingButton } from './EditOfferingButton';
import { OpenPublicOffering } from './OpenPublicOffering';
import { PreviewOfferingButton } from './PreviewOfferingButton';

export const OfferingActions = ({ row, refetch }) => (
  <DropdownButton title={translate('Actions')} className="me-3">
    <EditOfferingButton row={row} />
    <PreviewOfferingButton row={row} />
    <OpenPublicOffering row={row} />
    <DeleteOfferingButton row={row} refetch={refetch} />
  </DropdownButton>
);
