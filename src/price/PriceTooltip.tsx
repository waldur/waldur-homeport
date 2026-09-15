import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

interface PriceTooltipProps {
  estimated?: boolean;
  size?: number;
}

export const PriceTooltip: FC<PriceTooltipProps> = ({
  estimated,
  size = 15,
}) => {
  // VAT is not included only when accounting mode is activated
  const parts = [];
  if (ENV.accountingMode === 'accounting') {
    parts.push(translate('VAT is not included.'));
  }

  if (estimated) {
    parts.push(translate('Price is estimated.'));
  }

  const message = parts.join(' ');

  if (!message) {
    return null;
  }

  return (
    <span className="ms-1 hidden-print">
      <Tooltip label={message}>
        <WarningCircleIcon weight="bold" size={size} />
      </Tooltip>
    </span>
  );
};
