import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';

export const ResourceEvents = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.resource.url,
  }),
});

export default connectAngularComponent(ResourceEvents, ['resource']);
