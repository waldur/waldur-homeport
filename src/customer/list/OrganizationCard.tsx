import { FunctionComponent, MouseEvent, useCallback } from 'react';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import {
  OrganizationLink,
  useOrganizationLink,
} from '@/customer/list/OrganizationLink';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { propVal } from '@/property/propertyFields';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

interface OrganizationCardProps {
  organization: Customer;
  onClickDetails?(row): void;
}

export const OrganizationCard: FunctionComponent<OrganizationCardProps> = ({
  organization,
  onClickDetails,
}) => {
  const user = useUser();
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    organization.display_billing_info_in_projects === false;
  const { navigate } = useOrganizationLink(organization.uuid);
  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: organization.uuid,
  });

  const handleCardClick = useCallback(() => {
    onClickDetails?.(organization);
    navigate();
  }, [onClickDetails, organization, navigate]);

  const stopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <ModelCard1
      title={organization.name}
      ellipsisLines={2}
      logo={organization.image}
      clickable
      onClick={handleCardClick}
      body={
        <div className="text-sm">
          <PropertyList
            variant="summary"
            termWidth="sm"
            space={1.5}
            emptyPlaceholder="dash"
            hideIfEmpty={false}
          >
            <PropertyItem
              label={translate('Email')}
              value={organization.email}
              valueClass="ellipsis"
            />

            <PropertyItem
              label={translate('Projects')}
              value={propVal.number(organization.projects_count)}
            />

            <PropertyItem
              label={translate('Created')}
              value={propVal.date(organization.created)}
            />

            {!shouldConcealPrices && (
              <>
                <PropertyItem
                  label={translate('Cost estimation')}
                  value={propVal.currency(
                    organization.billing_price_estimate?.total || 0,
                  )}
                />

                <PropertyItem
                  label={translate('Remaining credit')}
                  value={propVal.currency(organization.customer_credit)}
                  hideIfEmpty
                />
              </>
            )}
          </PropertyList>
        </div>
      }
      footer={
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="flex justify-end items-center gap-1.5"
          onClick={stopPropagation}
        >
          {canEditCustomer && (
            <Link
              state="organization-manage"
              params={{ uuid: organization.uuid }}
              buttonVariant="text-primary"
              buttonSize="sm"
            >
              {translate('Edit')}
            </Link>
          )}
          <OrganizationLink
            uuid={organization.uuid}
            onClick={() => onClickDetails?.(organization)}
            buttonVariant="text-primary"
            buttonSize="sm"
            asButton
          >
            {translate('Details')}
          </OrganizationLink>
        </div>
      }
    />
  );
};
