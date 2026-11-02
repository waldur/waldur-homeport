import { UserGearIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplaceOfferingUsersList,
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
  ServiceProviderAccount,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getExposedUserAttributes } from '@/marketplace/offerings/details/OfferingUserDetailsDialog';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface ProviderAccountDetailsDialogProps {
  resolve: { account: ServiceProviderAccount; providerCustomerUuid: string };
}

/** Who a provider account belongs to, as the offerings expose the person. */
export const ProviderAccountDetailsDialog: FC<
  ProviderAccountDetailsDialogProps
> = ({ resolve: { account, providerCustomerUuid } }) => {
  // Identity attributes are exposed per offering; any of the person's
  // accounts on this provider's offerings will do.
  const offeringUserQuery = useQuery({
    queryKey: [
      'provider-account-offering-user',
      providerCustomerUuid,
      account.user_uuid,
    ],
    queryFn: () =>
      marketplaceOfferingUsersList({
        query: {
          provider_uuid: providerCustomerUuid,
          user_uuid: account.user_uuid,
          page_size: 1,
        },
      }).then((response) => response.data?.[0] ?? null),
    staleTime: UI_STALE_TIME,
  });
  const offeringUser = offeringUserQuery.data;
  const offeringUuid = offeringUser?.offering_uuid;

  const configQuery = useQuery({
    queryKey: ['offering-user-attribute-config', offeringUuid],
    queryFn: () =>
      marketplaceProviderOfferingsUserAttributeConfigRetrieve({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    enabled: Boolean(offeringUuid),
    staleTime: UI_STALE_TIME,
  });

  const isLoading =
    offeringUserQuery.isLoading ||
    (Boolean(offeringUuid) && configQuery.isLoading);
  const error = offeringUserQuery.error || configQuery.error;
  const refetch = () => {
    offeringUserQuery.refetch();
    if (offeringUuid) {
      configQuery.refetch();
    }
  };

  const exposedUserAttributes = useMemo(
    () => getExposedUserAttributes(configQuery.data, offeringUser),
    [configQuery.data, offeringUser],
  );

  return (
    <ModalDialog
      title={translate('Provider account details')}
      iconNode={<UserGearIcon weight="bold" />}
      iconColor="success"
      footer={<CloseDialogButton />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={
            offeringUserQuery.error
              ? translate('Unable to load offering user.')
              : translate('Unable to load user attribute configuration.')
          }
          loadData={refetch}
        />
      ) : (
        <PropertyList termWidth="md">
          {exposedUserAttributes.length ? (
            exposedUserAttributes.map((attr) => (
              <PropertyItem
                key={attr.key}
                label={attr.label}
                value={attr.value}
                copyable={attr.copyable}
              />
            ))
          ) : (
            <PropertyItem
              label={translate('Identity attributes')}
              value={translate('None exposed to this provider')}
            />
          )}
          <PropertyItem
            label={translate('Provider username')}
            value={account.username}
            copyable
          />
          <PropertyItem
            label={translate('State')}
            value={<OfferingUserStateField row={account} />}
          />
        </PropertyList>
      )}
    </ModalDialog>
  );
};
