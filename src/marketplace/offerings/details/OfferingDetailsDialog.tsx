import { CaretRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  marketplaceCategoriesRetrieve,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { canViewOfferingPages } from '@/marketplace/canUseMarketplaceShopUi';
import { getTabs } from '@/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@/marketplace/details/OfferingTabsComponent';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useUser } from '@/workspace/hooks';

interface OfferingDetailsDialogProps {
  resolve: { offering: PublicOfferingDetails; concealBillingInfo?: boolean };
}

async function loadData(
  offering: PublicOfferingDetails,
  concealBillingInfo: boolean,
) {
  const category = await marketplaceCategoriesRetrieve({
    path: { uuid: offering.category_uuid },
  }).then((response) => response.data);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections, concealBillingInfo });
  return {
    offering,
    tabs,
  };
}

export const OfferingDetailsDialog: React.FC<OfferingDetailsDialogProps> = (
  props,
) => {
  const user = useUser();
  const showOfferingLink = canViewOfferingPages(user);
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['OfferingDetailsDialog', props.resolve.offering],
    queryFn: () =>
      loadData(props.resolve.offering, props.resolve.concealBillingInfo),
  });
  return (
    <ModalDialog
      title={translate('Offering details')}
      subtitle={
        <ScopeSubtitle
          label={translate('Offering name')}
          name={props.resolve.offering.name}
        />
      }
      bodyClassName="h-[500px]"
      footer={
        showOfferingLink ? (
          <OfferingDetailsLink
            offering_uuid={props.resolve.offering.uuid}
            buttonVariant="secondary"
          >
            {translate('More details')}
            <CaretRightIcon size={16} weight="bold" />
          </OfferingDetailsLink>
        ) : undefined
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <h3>{translate('Unable to load offering details.')}</h3>
      ) : (
        <>
          <PropertyList variant="summary" valueClass="text-secondary">
            <PropertyItem
              label={translate('Name')}
              value={value.offering.name}
            />
            <PropertyItem
              label={translate('Service provider')}
              value={value.offering.customer_name}
            />
            <PropertyItem
              label={translate('Parent offering')}
              value={value.offering.parent_name}
            />
          </PropertyList>
          <OfferingTabsComponent tabs={value.tabs} />
        </>
      )}
    </ModalDialog>
  );
};
