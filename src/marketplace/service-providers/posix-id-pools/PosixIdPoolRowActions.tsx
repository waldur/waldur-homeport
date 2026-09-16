import { PosixIdPool } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { PosixIdPoolDeleteButton } from './PosixIdPoolDeleteButton';
import { PosixIdPoolEditButton } from './PosixIdPoolEditButton';
import { PosixIdPoolIdentitiesButton } from './PosixIdPoolIdentitiesButton';

interface PosixIdPoolRowActionsProps {
  row: PosixIdPool;
  pools?: PosixIdPool[];
  refetch: () => void;
}

export const PosixIdPoolRowActions = ({
  row,
  pools,
  refetch,
}: PosixIdPoolRowActionsProps) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <PosixIdPoolIdentitiesButton row={row} />
    <PosixIdPoolEditButton row={row} pools={pools} refetch={refetch} />
    <PosixIdPoolDeleteButton row={row} refetch={refetch} />
  </ActionsDropdown>
);
