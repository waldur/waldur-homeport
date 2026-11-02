import { useQuery } from '@tanstack/react-query';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { getIdentityProviders } from '@/administration/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';

// The endpoints a provider publishes, in the order a sign-in uses them.
const URLS = [
  { name: 'discovery_url', label: () => translate('Discovery URL') },
  { name: 'auth_url', label: () => translate('Auth URL') },
  { name: 'token_url', label: () => translate('Token URL') },
  { name: 'userinfo_url', label: () => translate('User info URL') },
  { name: 'logout_url', label: () => translate('Logout URL') },
  { name: 'management_url', label: () => translate('Management URL') },
] as const;

export const ProviderDetailsDialog = (props) => {
  const neededProvider = props.provider.provider;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['IdentityProviderDetails', neededProvider],
    queryFn: () =>
      getIdentityProviders().then((providers) =>
        providers.find((item) => item.provider === neededProvider),
      ),
  });

  const title = translate('Details for {provider}', {
    provider: props.resolve.type,
  });

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred message={title} loadData={refetch} />
  ) : (
    <ModalDialog
      title={title}
      footer={<CloseDialogButton label={translate('OK')} />}
    >
      {data && (
        <PropertyList detailsMode>
          {URLS.map(({ name, label }) => (
            <PropertyItem
              key={name}
              value={propVal.url(data[name])}
              label={label()}
              valueClass="wrap-anywhere"
              hasCopy
              hideIfEmpty
            />
          ))}
        </PropertyList>
      )}
    </ModalDialog>
  );
};
