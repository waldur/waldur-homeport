import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { customersList, customersRetrieve } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser, useCustomer } from '@/workspace/hooks';

const OfferingCreateDialog = lazyComponent(() =>
  import('../actions/OfferingCreateDialog').then((module) => ({
    default: module.OfferingCreateDialog,
  })),
);

const useCreateOffering = (fetch?, showProvider = false) => {
  const { openDialog } = useModal();
  const customer = useCustomer();
  const user = useUser();

  const canCreate =
    user.is_staff ||
    (customer?.is_service_provider &&
      hasPermission(user, {
        permission: PermissionEnum.CREATE_OFFERING,
        customerId: customer.uuid,
      }));

  const openCreateDialog = () =>
    openDialog(OfferingCreateDialog, {
      resolve: { fetch, showProvider },
    });

  return { canCreate, openCreateDialog };
};

export const CreateOfferingButton = ({
  fetch,
  className,
  showProvider = false,
}: {
  fetch?;
  className?;
  showProvider?: boolean;
}) => {
  const { canCreate, openCreateDialog } = useCreateOffering(
    fetch,
    showProvider,
  );

  if (canCreate) {
    return (
      <AddButton
        action={openCreateDialog}
        className={className}
        data-testid="offering-add-btn"
      />
    );
  } else {
    return null;
  }
};

// The same action as an item of the list's Actions menu.
export const CreateOfferingAction = ({
  fetch,
  showProvider = false,
}: {
  fetch?;
  showProvider?: boolean;
}) => {
  const { canCreate, openCreateDialog } = useCreateOffering(
    fetch,
    showProvider,
  );
  return canCreate ? (
    <ActionItem
      title={translate('Add offering')}
      action={openCreateDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  ) : null;
};

interface ProviderOption {
  name: string;
  url: string;
  uuid: string;
}

/**
 * The service providers a user who is not staff may create offerings for:
 * the organizations they have a role in that are service providers, kept to
 * those their role lets them create offerings for. One request, so the
 * picker lists them all instead of a page of providers filtered down.
 */
const useCreatableProviders = (enabled: boolean) => {
  const user = useUser();
  return useQuery({
    queryKey: ['offering-create-providers', user?.uuid],
    queryFn: () =>
      customersList({
        query: {
          user_uuid: user.uuid,
          is_service_provider: true,
          field: ['name', 'url', 'uuid'],
          o: 'name',
          page_size: 300,
        },
      }).then((response) =>
        (response.data as ProviderOption[]).filter((provider) =>
          hasPermission(user, {
            permission: PermissionEnum.CREATE_OFFERING,
            customerId: provider.uuid,
          }),
        ),
      ),
    enabled,
    staleTime: 60_000,
  });
};

/**
 * Add offering where no organization is open, such as the marketplace's
 * offerings list. Staff pick any service provider; anyone else sees the
 * button only when they may create offerings for some service provider,
 * and picks among those. It opens on `providerUuid` (the page's
 * organization filter) when that is one of the providers offered.
 */
export const CreateOfferingForProviderButton = ({
  providerUuid,
  fetch,
}: {
  providerUuid?: string;
  fetch?;
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const isStaff = Boolean(user?.is_staff);
  // Without a role that may create offerings, there is nothing to ask for.
  const mayCreateSomewhere = (user?.permissions ?? []).some(
    (permission) =>
      permission.scope_type === 'customer' &&
      hasPermission(user, {
        permission: PermissionEnum.CREATE_OFFERING,
        customerId: permission.scope_uuid,
      }),
  );
  const { data: providers } = useCreatableProviders(
    !isStaff && mayCreateSomewhere,
  );
  const { data: staffProvider } = useQuery({
    queryKey: ['offering-create-provider', providerUuid],
    queryFn: () =>
      customersRetrieve({
        path: { uuid: providerUuid },
        query: { field: ['name', 'url', 'uuid', 'is_service_provider'] },
      }).then((response) => response.data),
    enabled: isStaff && Boolean(providerUuid),
    staleTime: 60_000,
  });
  if (!isStaff && !providers?.length) {
    return null;
  }
  const initialProvider = isStaff
    ? staffProvider?.is_service_provider && staffProvider.url
      ? {
          name: staffProvider.name,
          url: staffProvider.url,
          uuid: staffProvider.uuid,
        }
      : undefined
    : providers.find((provider) => provider.uuid === providerUuid);
  return (
    <AddButton
      action={() =>
        openDialog(OfferingCreateDialog, {
          resolve: {
            fetch,
            showProvider: true,
            initialProvider,
            providers: isStaff ? undefined : providers,
          },
        })
      }
      data-testid="catalog-offering-add-btn"
    />
  );
};
