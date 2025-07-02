import { PlusIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { TableDropdownItem } from '@waldur/table/types';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

import { Offering, ServiceProvider } from '../types';

import { OFFERING_IMPORT_FORM_ID } from './import/constants';
import { OfferingBreadcrumbPopover } from './OfferingBreadcrumbPopover';

const OfferingImportDialog = lazyComponent(() =>
  import('./import/OfferingImportDialog').then((module) => ({
    default: module.OfferingImportDialog,
  })),
);

export const useOfferingDropdownActions = (refetch?): TableDropdownItem[] => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useUser();
  const canCreateOffering = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING,
    customerId: customer?.uuid,
  });
  const showOfferingListActions =
    customer && customer.is_service_provider && canCreateOffering;

  if (!showOfferingListActions) {
    return [];
  }

  return [
    {
      label: translate('Import offerings'),
      iconNode: <PlusIcon weight="bold" />,
      action: () => {
        dispatch(
          openModalDialog(OfferingImportDialog, {
            refetch,
            size: 'lg',
            formId: OFFERING_IMPORT_FORM_ID,
          }),
        );
      },
    },
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
      dropdown: provider
        ? () => <OfferingBreadcrumbPopover provider={provider} page={page} />
        : undefined,
      truncate: true,
      active: true,
    },
  ];
};
