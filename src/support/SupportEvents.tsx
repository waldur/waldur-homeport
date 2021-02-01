import { getEventsList } from '@waldur/events/BaseEventsList';

export const SupportEvents = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.resource.url,
  }),
});
