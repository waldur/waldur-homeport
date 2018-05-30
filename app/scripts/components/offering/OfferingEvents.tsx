import { getEventsList } from '@waldur/events/BaseEventsList';
import { connectAngularComponent } from '@waldur/store/connect';

export const OfferingEvents = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.offering.issue,
  }),
});

export default connectAngularComponent(OfferingEvents, ['offering']);
