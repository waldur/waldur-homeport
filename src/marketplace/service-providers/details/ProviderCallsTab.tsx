import { PublicCallsList } from '@/proposals/PublicCallsList';

export const ProviderCallsTab = (props) => {
  return (
    <PublicCallsList provider_uuid={props.provider_uuid} offering_uuid={null} />
  );
};
