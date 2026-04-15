import { FC, useMemo } from 'react';
import { BasePublicPlan } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

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
    <tr>
      <td colSpan={4} className="text-end fw-bold">
        {translate('Total:')}
      </td>
      <td className="fw-bold">EUR {total.toFixed(2)}</td>
      <td className="fw-bold">
        EUR {(total * secondaryMultiplier).toFixed(2)}
      </td>
    </tr>
  );
};
