import { getEventsList } from '@waldur/events/BaseEventsList';

export const OfferingEvents = getEventsList({
  mapPropsToFilter: props => ({
    scope: props.offering.issue,
  }),
});
