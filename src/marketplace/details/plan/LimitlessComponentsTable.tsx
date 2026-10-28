import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';

import { Component } from './types';

export const LimitlessComponentsTable = ({
  components,
  concealBillingInfo,
}: {
  components: Component[];
  concealBillingInfo?: boolean;
}) => {
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) || concealBillingInfo;
  return (
    <div className="mb-3">
      <Table density="normal">
        <TableHeader>
          <TableRow>
            <TableHead>{translate('Component name')}</TableHead>
            <TableHead>{translate('Unit')}</TableHead>
            {!shouldConcealPrices && (
              <TableHead>
                {translate('Price per unit')}
                <PriceTooltip />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-primary">
                {component.name}
              </TableCell>
              <TableCell>{component.measured_unit}</TableCell>
              {!shouldConcealPrices && (
                <TableCell>
                  {formatCurrency(
                    component.price,
                    ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                    4,
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
