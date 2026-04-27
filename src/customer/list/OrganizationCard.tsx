import { FunctionComponent, MouseEvent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
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
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';
import { getUser } from '@/workspace/selectors';
import { Customer } from '@/workspace/types';

interface OrganizationCardProps {
  organization: Customer;
  onClickDetails?(row): void;
}

export const OrganizationCard: FunctionComponent<OrganizationCardProps> = ({
  organization,
  onClickDetails,
}) => {
  const user = useSelector(getUser);
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
        <div className="fs-6">
          <Field
            label={translate('Email')}
            value={renderFieldOrDash(organization.email)}
            space={2}
            labelCol={6}
            valueCol={6}
            valueClass="ellipsis"
          />

          <Field
            label={translate('Projects')}
            value={renderFieldOrDash(organization.projects_count)}
            space={2}
            labelCol={6}
            valueCol={6}
          />

          <Field
            label={translate('Created')}
            value={formatDate(organization.created)}
            space={2}
            labelCol={6}
            valueCol={6}
          />

          {!shouldConcealPrices && (
            <>
              <Field
                label={translate('Cost estimation')}
                value={defaultCurrency(
                  (organization.billing_price_estimate &&
                    organization.billing_price_estimate.total) ||
                    0,
                )}
                space={2}
                labelCol={6}
                valueCol={6}
              />

              {(organization.customer_credit ||
                organization.customer_credit === 0) && (
                <Field
                  label={translate('Remaining credit')}
                  value={renderFieldOrDash(
                    defaultCurrency(organization.customer_credit),
                  )}
                  space={2}
                  labelCol={6}
                  valueCol={6}
                />
              )}
            </>
          )}
        </div>
      }
      footer={
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="d-flex justify-content-end align-items-center gap-2"
          onClick={stopPropagation}
        >
          {canEditCustomer && (
            <Link
              state="organization-manage"
              params={{ uuid: organization.uuid }}
              buttonVariant="text-primary"
              className="btn-sm"
            >
              {translate('Edit')}
            </Link>
          )}
          <OrganizationLink
            uuid={organization.uuid}
            onClick={() => onClickDetails?.(organization)}
            buttonVariant="text-primary"
            className="btn-sm"
            asButton
          >
            {translate('Details')}
          </OrganizationLink>
        </div>
      }
    />
  );
};
