import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

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
        <TosNotification />
        <OfferingTosNotification offering={offering} />
      </Card.Body>
    </Card>
  );
};
