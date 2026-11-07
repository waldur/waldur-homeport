import { FC, useMemo } from 'react';
import { BasePublicPlan } from 'waldur-js-client';

import { TableCell, TableRow } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

interface ComponentTotalRowProps {
  components: Array<{
    type: string;
    changedLimit: number;
  }>;
  plan: BasePublicPlan;
  secondaryMultiplier?: number;
}

export const ComponentTotalRow: FC<ComponentTotalRowProps> = ({
  components,
  plan,
  secondaryMultiplier = 12,
}) => {
  const total = useMemo(() => {
    return components.reduce((sum, component) => {
      const price = Number(plan?.prices?.[component.type]) || 0;
      const newLimit = component.changedLimit;
      return sum + price * newLimit;
    }, 0);
  }, [components, plan]);

  return (
    <TableRow>
      <TableCell colSpan={4} className="text-end font-medium">
        {translate('Total:')}
      </TableCell>
      <TableCell className="font-medium">
        {ENV.plugins.WALDUR_CORE.CURRENCY_NAME} {total.toFixed(2)}
      </TableCell>
      <TableCell className="font-medium">
        {ENV.plugins.WALDUR_CORE.CURRENCY_NAME}{' '}
        {(total * secondaryMultiplier).toFixed(2)}
      </TableCell>
    </TableRow>
  );
};
