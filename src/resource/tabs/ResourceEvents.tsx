import { getEventsList } from '@waldur/events/BaseEventsList';

export const ResourceEvents = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.resource.url,
  }),
});
