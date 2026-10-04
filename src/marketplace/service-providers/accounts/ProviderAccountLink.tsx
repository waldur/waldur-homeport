import { IdentificationCardIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingUser } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ProviderAccountLookupDialog = lazyComponent(() =>
  import('./ProviderAccountLookupDialog').then((m) => ({
    default: m.ProviderAccountLookupDialog,
  })),
);

type BackedFields = Pick<
  OfferingUser,
  'service_provider_account_uuid' | 'service_provider_account_username'
>;

/**
 * Whether an offering account reads through a provider account. Decided per
 * account, not by the offering's or the provider's scope: an offering put back
 * to per-offering accounts keeps every account it still owns editable.
 */
export const isProviderBacked = (row?: Partial<BackedFields>): boolean =>
  Boolean(row?.service_provider_account_uuid);

/**
 * Whether new accounts on this offering are provider accounts: the offering's
 * effective account scope (its own setting, else the provider's). Their
 * username comes from the provider account, so nothing should ask for one --
 * the backend ignores it.
 */
export const sharesProviderAccounts = (offering?: {
  account_settings?: { account_scope?: { value?: unknown } } | null;
}): boolean => offering?.account_settings?.account_scope?.value === 'provider';

/** Opens the details of the provider account an offering account reads through. */
const useOpenProviderAccount = () => {
  const { openDialog } = useModal();
  return (
    row: Pick<OfferingUser, 'service_provider_account_uuid' | 'customer_uuid'>,
  ) =>
    openDialog(ProviderAccountLookupDialog, {
      resolve: {
        accountUuid: row.service_provider_account_uuid,
        providerCustomerUuid: row.customer_uuid,
      },
      size: 'lg',
    });
};

/**
 * A "Provider account" link on a backed offering account, opening the account
 * it reads through. Renders nothing for a per-offering account.
 */
export const ProviderAccountButton: FC<{
  row: BackedFields & Pick<OfferingUser, 'customer_uuid'>;
}> = ({ row }) => {
  const openProviderAccount = useOpenProviderAccount();
  if (!isProviderBacked(row)) {
    return null;
  }
  return (
    <BaseButton
      variant="text-primary"
      size="sm"
      label={translate('Provider account')}
      iconNode={<IdentificationCardIcon weight="bold" />}
      tooltip={translate(
        'Shared with the provider’s other offerings. The username and POSIX attributes are managed on the provider account {username}.',
        { username: row.service_provider_account_username },
      )}
      onClick={() => openProviderAccount(row)}
      data-testid="provider-account-link"
    />
  );
};

/** Row action opening the provider account a backed offering account reads through. */
export const ProviderAccountAction: FC<{ row: OfferingUser }> = ({ row }) => {
  const openProviderAccount = useOpenProviderAccount();
  if (!isProviderBacked(row)) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Provider account')}
      action={() => openProviderAccount(row)}
      iconNode={<IdentificationCardIcon weight="bold" />}
    />
  );
};
