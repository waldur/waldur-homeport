import * as React from 'react';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';
import { User } from '@waldur/workspace/types';

interface UserEventsProps {
  showActions?: boolean;
  user: User;
}

export const UserEvents: React.SFC<UserEventsProps> = outerProps => outerProps.user ? getEventsList({
  mapPropsToFilter: props => ({
    scope: props.user.url,
    feature: 'users',
    exclude_extra: true,
  }),
})(outerProps) : null;

UserEvents.defaultProps = {
  showActions: true,
};

export default connectAngularComponent(UserEvents, ['user']);
