import { FunctionComponent } from 'react';

import { useUser } from '@/workspace/hooks';

import { ExpandableEventDetailsTable } from './ExpandableEventDetailsTable';
import { Event } from './types';

interface ExpandableEventDetailsProps {
  row: Event;
}

export const ExpandableEventDetails: FunctionComponent<
  ExpandableEventDetailsProps
> = ({ row }) => {
  const user = useUser();
  const isStaffOrSupport = user?.is_staff || user?.is_support;

  return (
    <ExpandableEventDetailsTable
      event={row}
      isStaffOrSupport={isStaffOrSupport}
    />
  );
};
