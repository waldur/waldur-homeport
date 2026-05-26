import { FC } from 'react';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { DeleteProfileAction } from './DeleteProfileAction';
import { EditProfileAction } from './EditProfileAction';

interface OfferingProfilesRowActionsProps {
  row: any;
  refetch(): void;
}

export const OfferingProfilesRowActions: FC<
  OfferingProfilesRowActionsProps
> = ({ row, refetch }) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <EditProfileAction row={row} refetch={refetch} />
    <DeleteProfileAction row={row} refetch={refetch} />
  </ActionsDropdown>
);
