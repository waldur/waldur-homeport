import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceServiceProviderAccountsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { ProviderAccountDetailsDialog } from './ProviderAccountDetailsDialog';

interface ProviderAccountLookupDialogProps {
  resolve: { accountUuid: string; providerCustomerUuid: string };
}

/** The details of a provider account known only by its UUID. */
export const ProviderAccountLookupDialog: FC<
  ProviderAccountLookupDialogProps
> = ({ resolve: { accountUuid, providerCustomerUuid } }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['service-provider-account', accountUuid],
    queryFn: () =>
      marketplaceServiceProviderAccountsRetrieve({
        path: { uuid: accountUuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  if (data) {
    return (
      <ProviderAccountDetailsDialog
        resolve={{ account: data, providerCustomerUuid }}
      />
    );
  }
  return (
    <ModalDialog title={translate('Provider account details')}>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load the provider account.')}
          loadData={refetch}
        />
      ) : null}
    </ModalDialog>
  );
};
