import { useBoolean } from 'react-use';

import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { AcceptAction } from './AcceptAction';
import { CancelAction } from './CancelAction';

const ActionsList = [AcceptAction, CancelAction];

export const BookingActions = ({ resource, refetch }) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      actions={ActionsList}
      resource={resource}
      refetch={refetch}
    />
  );
};
