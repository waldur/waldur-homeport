import { ProviderOrdersList } from '../ProviderOrdersList';

export const ProviderOrdersTab = (props) => {
  return <ProviderOrdersList provider={props.provider} standalone={false} />;
};
