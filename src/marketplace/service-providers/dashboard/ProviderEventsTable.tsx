import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';

const ProviderEvents = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.provider ? props.provider.customer : undefined,
    feature: ['providers'],
  }),
  mapPropsToTableId: (props) => [props.provider?.uuid],
});

export const ProviderEventsTable = ({ provider }) => {
  return (
    <ProviderEvents
      title={translate('Audit logs')}
      initialPageSize={5}
      provider={provider}
    />
  );
};
