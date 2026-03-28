import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { OfferingTosNotification } from './OfferingTosNotification';

export const DeployPageTotalCard: FC<
  PropsWithChildren<{
    total?;
    offering;
    header?;
    shouldConcealPrices?: boolean;
  }>
> = ({ total, offering, header, children, ...props }) => {
  const shouldConcealPrices =
    props.shouldConcealPrices ??
    isFeatureVisible(MarketplaceFeatures.conceal_prices);
  return (
    <Card className="card-bordered w-100">
      <Card.Header>
        {header ? (
          header
        ) : (
          <>
            <h3 className="fw-normal text-gray-700 mb-0">
              {translate('Total')}:
            </h3>
            <div className="card-toolbar">
              <h3 className="fw-bold mb-0">
                {shouldConcealPrices ? DASH_ESCAPE_CODE : total}
              </h3>
            </div>
          </>
        )}
      </Card.Header>
      <Card.Body>
        {children}
        {offering?.plugin_options?.require_purchase_order_upload ? (
          <div className="d-flex align-items-center gap-2 mt-4 mb-4 text-warning fs-7">
            {}
            <WarningCircleIcon
              size={16}
              weight="fill"
              className="flex-shrink-0"
            />
            <Tip
              id="po-required-tip"
              label={translate(
                'After this order is created, a purchase order document (PDF) will need to be uploaded before it can be approved.',
              )}
            >
              <span className="fw-semibold">
                {translate('Purchase order will be required')}
              </span>
            </Tip>
          </div>
        ) : offering?.plugin_options?.enable_purchase_order_upload ? (
          <div className="d-flex align-items-center gap-2 mt-4 mb-4 text-info fs-7">
            <Tip
              id="po-optional-tip"
              label={translate(
                'After this order is created, a purchase order document (PDF) can optionally be attached before approval.',
              )}
            >
              <span>{translate('Purchase order can be attached')}</span>
            </Tip>
          </div>
        ) : null}
        <TosNotification />
        <OfferingTosNotification offering={offering} />
      </Card.Body>
    </Card>
  );
};
