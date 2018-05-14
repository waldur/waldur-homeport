import * as React from 'react';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';
import { User } from '@waldur/workspace/types';

export const UserEvents: React.SFC<{user: User}> = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.user.url,
    feature: 'users',
    exclude_extra: true,
  }),
});

export default connectAngularComponent(UserEvents, ['user']);
