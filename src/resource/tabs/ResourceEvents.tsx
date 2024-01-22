import { getEventsList } from '@waldur/events/BaseEventsList';

export const ResourceEvents = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.resource ? props.resource.url : props.marketplaceResource.url,
  }),
  mapPropsToTableId: (props) => [
    props.resource ? props.resource.uuid : props.marketplaceResource.uuid,
  ],
});
