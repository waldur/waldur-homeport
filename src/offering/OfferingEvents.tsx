import { getEventsList } from '@waldur/events/BaseEventsList';
import { Offering } from '@waldur/offering/types';

export const OfferingEvents: React.ComponentType<{
  offering: Offering;
}> = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.offering.url,
  }),
});
