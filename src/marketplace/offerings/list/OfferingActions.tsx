import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ChangeOfferingAvailabilityAction } from '../actions/ChangeOfferingAvailabilityAction';
import { SetOfferingTypeAction } from '../actions/SetOfferingTypeAction';

import { DeleteOfferingButton } from './DeleteOfferingButton';
import { EditOfferingButton } from './EditOfferingButton';
import { ExportOfferingButton } from './ExportOfferingButton';
import { MoveOfferingAction } from './MoveOfferingAction';
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
      ExportOfferingButton,
      MoveOfferingAction,
      SetOfferingTypeAction,
      ChangeOfferingAvailabilityAction,
      DeleteOfferingButton,
    ]}
  />
);
