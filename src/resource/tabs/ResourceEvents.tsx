import { getEventsList } from '@waldur/events/BaseEventsList';

export const ResourceEvents = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.resource.url,
  }),
  mapPropsToTableId: (props) => (props.resource ? [props.resource.uuid] : []),
});
