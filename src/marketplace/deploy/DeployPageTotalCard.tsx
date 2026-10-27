import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { TosNotification } from '@/form/TosNotification';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { OfferingTosNotification } from './OfferingTosNotification';
import { OrderAutoApprovalNotice } from './OrderAutoApprovalNotice';

export const DeployPageTotalCard: FC<
  PropsWithChildren<{
    total?;
    offering;
    header?;
    shouldConcealPrices?: boolean;
    monthlyRecurringCost?: number;
  }>
> = ({ total, offering, header, children, monthlyRecurringCost, ...props }) => {
  const shouldConcealPrices =
    props.shouldConcealPrices ??
    isFeatureVisible(MarketplaceFeatures.conceal_prices);
  return (
    <Card className="card-bordered w-full">
      <Card.Header>
        {header ? (
          header
        ) : (
          <>
            <h3 className="font-normal text-secondary mb-0">
              {translate('Total')}:
            </h3>
            <div className="card-toolbar">
              <h3 className="font-medium mb-0">
                {shouldConcealPrices ? DASH_ESCAPE_CODE : total}
              </h3>
            </div>
          </>
        )}
      </Card.Header>
      <Card.Body>
        {children}
        {offering?.plugin_options?.require_purchase_order_upload ? (
          <div className="flex items-center gap-1.5 mt-3 mb-3 text-warning text-xs">
            {}
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            <Tooltip
              label={translate(
                'After this order is created, a purchase order document (PDF) will need to be uploaded before it can be approved.',
              )}
            >
              <span>{translate('Purchase order will be required')}</span>
            </Tooltip>
          </div>
        ) : offering?.plugin_options?.enable_purchase_order_upload ? (
          <div className="flex items-center gap-1.5 mt-3 mb-3 text-info text-xs">
            <Tooltip
              label={translate(
                'After this order is created, a purchase order document (PDF) can optionally be attached before approval.',
              )}
            >
              <span>{translate('Purchase order can be attached')}</span>
            </Tooltip>
          </div>
        ) : null}
        {typeof monthlyRecurringCost === 'number' && (
          <OrderAutoApprovalNotice
            offering={offering}
            monthlyCost={monthlyRecurringCost}
          />
        )}
        <TosNotification />
        <OfferingTosNotification offering={offering} />
      </Card.Body>
    </Card>
  );
};
