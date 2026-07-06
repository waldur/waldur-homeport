import { PosixIdPool } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { PosixIdPoolDeleteButton } from './PosixIdPoolDeleteButton';
import { PosixIdPoolEditButton } from './PosixIdPoolEditButton';
import { PosixIdPoolIdentitiesButton } from './PosixIdPoolIdentitiesButton';

interface PosixIdPoolRowActionsProps {
  row: PosixIdPool;
  refetch: () => void;
}

export const PosixIdPoolRowActions = ({
  row,
  refetch,
}: PosixIdPoolRowActionsProps) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <PosixIdPoolIdentitiesButton row={row} />
    <PosixIdPoolEditButton row={row} refetch={refetch} />
    <PosixIdPoolDeleteButton row={row} refetch={refetch} />
  </ActionsDropdown>
);
