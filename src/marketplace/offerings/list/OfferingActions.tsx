import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { DeleteOfferingButton } from './DeleteOfferingButton';
import { EditOfferingButton } from './EditOfferingButton';
import { OpenPublicOffering } from './OpenPublicOffering';
import { PreviewOfferingButton } from './PreviewOfferingButton';

export const OfferingActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      EditOfferingButton,
      PreviewOfferingButton,
      OpenPublicOffering,
      DeleteOfferingButton,
    ]}
  />
);
