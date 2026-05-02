import { GearIcon, PlusIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { IBreadcrumbItem } from '@/navigation/types';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

import { getServiceProviderByCustomer } from '../common/api';
import { Offering, ServiceProvider } from '../types';

import { OFFERING_IMPORT_FORM_ID } from './import/constants';
import { OfferingBreadcrumbPopover } from './OfferingBreadcrumbPopover';
import { SINGLE_OFFERING_IMPORT_FORM_ID } from './single-import/constants';

const SiteAgentConfigDialog = lazyComponent(() =>
  import('@/site-agent/SiteAgentConfigDialog').then((module) => ({
    default: module.SiteAgentConfigDialog,
  })),
);

const OfferingImportDialog = lazyComponent(() =>
  import('./import/OfferingImportDialog').then((module) => ({
    default: module.OfferingImportDialog,
  })),
);

const SingleOfferingImportDialog = lazyComponent(() =>
  import('./single-import/SingleOfferingImportDialog').then((module) => ({
    default: module.SingleOfferingImportDialog,
  })),
);

export const useOfferingDropdownActions = (refetch?) => {
  const { openDialog } = useModal();
  const customer = useSelector(getCustomer);
  const user = useUser();
  const canCreateOffering = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING,
    customerId: customer?.uuid,
  });
  const showOfferingListActions =
    customer && customer.is_service_provider && canCreateOffering;

  // Fetch ServiceProvider by customer UUID to get the actual ServiceProvider UUID
  const { data: serviceProvider } = useQuery({
    queryKey: ['ServiceProvider', customer?.uuid],
    queryFn: () =>
      customer?.uuid
        ? getServiceProviderByCustomer({ customer_uuid: customer.uuid })
        : null,
    enabled: !!customer?.uuid && !!customer?.is_service_provider,
  });

  if (!showOfferingListActions) {
    return null;
  }

  return [
    <ActionItem
      key="connect-remote-offerings"
      title={translate('Connect remote offerings')}
      action={() => {
        openDialog(OfferingImportDialog, {
          refetch,
          size: 'lg',
          formId: OFFERING_IMPORT_FORM_ID,
        });
      }}
      iconNode={<PlusIcon weight="bold" />}
    />,
    <ActionItem
      key="import-offering"
      title={translate('Import offering')}
      action={() => {
        openDialog(SingleOfferingImportDialog, {
          resolve: { refetch },
          size: 'lg',
          formId: SINGLE_OFFERING_IMPORT_FORM_ID,
        });
      }}
      iconNode={<UploadSimpleIcon weight="bold" />}
    />,
    <ActionItem
      key="generate-site-agent-config"
      title={translate('Generate Site Agent Config')}
      action={() => {
        openDialog(SiteAgentConfigDialog, {
          resolve: { provider: { uuid: serviceProvider?.uuid } },
          size: 'lg',
        });
      }}
      iconNode={<GearIcon weight="bold" />}
      disabled={!serviceProvider}
    />,
  ];
};

export const getOfferingBreadcrumbItems = (
  offering: Offering,
  provider: ServiceProvider,
  page: 'details' | 'edit',
): IBreadcrumbItem[] => {
  return [
    {
      key: 'marketplace',
      text: translate('Marketplace'),
      to: 'public.marketplace-landing',
    },
    {
      key: 'service-provider',
      text: offering?.customer_name || '...',
      to: 'marketplace-providers.details',
      params: offering ? { customer_uuid: offering.customer_uuid } : undefined,
      ellipsis: 'xl',
      maxLength: 11,
    },
    {
      key: 'marketplace-vendor-offerings',
      text: translate('Offerings'),
      to: 'marketplace-vendor-offerings',
      params: offering ? { uuid: offering.customer_uuid } : undefined,
      ellipsis: 'md',
    },
    {
      key: 'offering',
      text: offering?.name || '...',
      dropdown:
        provider && offering
          ? (close) => (
              <OfferingBreadcrumbPopover
                provider={provider}
                offering={offering}
                page={page}
                close={close}
              />
            )
          : undefined,
      truncate: true,
      active: true,
    },
  ];
};
