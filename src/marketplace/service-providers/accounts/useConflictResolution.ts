import {
  marketplaceServiceProvidersUsernameConflictsList,
  ProviderUsernameConflict,
  ServiceProvider,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

import { useServiceProviderUpdate } from '../useServiceProviderUpdate';

const AdoptProviderAccountsDialog = lazyComponent(() =>
  import('./AdoptProviderAccountsDialog').then((module) => ({
    default: module.AdoptProviderAccountsDialog,
  })),
);

/** Thrown to keep the caller's flow from closing the resolution dialog. */
export class UsernameConflictsPending extends Error {
  constructor() {
    super('Username conflicts must be resolved first');
    this.name = 'UsernameConflictsPending';
  }
}

export const fetchUsernameConflicts = async (
  provider: ServiceProvider,
): Promise<ProviderUsernameConflict[]> => {
  const response = await marketplaceServiceProvidersUsernameConflictsList({
    path: { uuid: provider.uuid },
  });
  return response.data;
};

/**
 * Opens the conflict report for a switch to per service provider accounts;
 * ``onResolved`` runs once every conflict is resolved, to complete the switch.
 */
export const useOpenConflictResolution = () => {
  const { openDialog } = useModal();
  return (
    provider: ServiceProvider,
    conflicts: ProviderUsernameConflict[],
    onResolved: () => unknown,
  ) =>
    openDialog(AdoptProviderAccountsDialog, {
      resolve: {
        provider,
        conflicts,
        refetch: onResolved,
        pendingSwitch: true,
      },
      size: 'lg',
    });
};

/**
 * The provider update behind the account settings edit fields. Switching to
 * per service provider accounts is refused while usernames conflict, so the
 * conflicts are shown for resolving instead of an error, and the switch is
 * saved once they are. Without conflicts the switch saves in one step.
 */
export const useGuardedProviderUpdate = (
  serviceProvider: ServiceProvider,
  setServiceProvider: (data: ServiceProvider) => void,
) => {
  const saveOptions = useServiceProviderUpdate(
    serviceProvider,
    setServiceProvider,
  );
  const openConflictResolution = useOpenConflictResolution();
  return async (formData) => {
    const switching =
      formData?.account_options?.account_scope === 'provider' &&
      serviceProvider.account_options?.account_scope !== 'provider';
    if (switching) {
      // A failed lookup falls through to the save, which the backend still
      // refuses with conflicts.
      const conflicts = await fetchUsernameConflicts(serviceProvider).catch(
        () => [] as ProviderUsernameConflict[],
      );
      if (conflicts.length) {
        openConflictResolution(serviceProvider, conflicts, () =>
          saveOptions(formData),
        );
        // The resolution dialog replaced the edit dialog; rejecting keeps the
        // edit flow from closing it.
        throw new UsernameConflictsPending();
      }
    }
    return saveOptions(formData);
  };
};
