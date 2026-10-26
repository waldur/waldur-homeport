import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import { Badge, type BadgeVariant } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';

interface ChangesAmountBadgeProps {
  changes: number;
  showOnInfinity?: boolean;
  showOnZero?: boolean;
  showSign?: boolean;
  fractionDigits?: number;
  /** Render changes number as it is */
  keepDecimals?: boolean;
  asBadge?: boolean;
  asPrice?: boolean;
  badgeSm?: boolean;
  reverseColor?: boolean;
  unit?: string;
}

export const ChangesAmountBadge: FC<ChangesAmountBadgeProps> = ({
  changes,
  showOnInfinity,
  showOnZero,
  showSign,
  fractionDigits = 2,
  keepDecimals,
  asBadge = true,
  asPrice,
  badgeSm,
  reverseColor,
  unit = '%',
}) => {
  const num = typeof changes === 'string' ? parseFloat(changes) : changes;

  const isNonZero = num !== 0 && !Number.isNaN(num);
  const isNegative = num < 0;
  const isInfinity = Math.abs(num) === Infinity;

  let colorVariant: BadgeVariant = 'neutral';
  let textColorClass = '';
  if (isNonZero) {
    if (isNegative) {
      colorVariant = reverseColor ? 'success' : 'danger';
      textColorClass = reverseColor ? 'text-success' : 'text-danger';
    } else {
      colorVariant = reverseColor ? 'danger' : 'success';
      textColorClass = reverseColor ? 'text-danger' : 'text-success';
    }
  }

  const renderNumber = (val: number) =>
    asPrice
      ? defaultCurrency(val)
      : keepDecimals
        ? val
        : val.toFixed?.(fractionDigits);

  const arrowIcon = isNegative ? (
    <ArrowDownIcon weight="bold" />
  ) : (
    <ArrowUpIcon weight="bold" />
  );

  if (isNonZero || num === undefined) {
    if (isInfinity) {
      if (!showOnInfinity) return null;
      if (asBadge) {
        return (
          <Badge
            variant={colorVariant}
            size={badgeSm ? 'sm' : undefined}
            tone="outline"
            onlyIcon
          >
            {arrowIcon}
          </Badge>
        );
      }
      return (
        <span className={classNames(textColorClass, 'text-base')}>
          {arrowIcon}
        </span>
      );
    }

    const content = (
      <>
        {showSign && (isNegative ? '-' : '+')}
        {renderNumber(isNegative ? Math.abs(num) : num)}
        {unit}
      </>
    );

    if (asBadge) {
      return (
        <Badge
          variant={colorVariant}
          size={badgeSm ? 'sm' : undefined}
          leftIcon={arrowIcon}
          tone="outline"
        >
          {content}
        </Badge>
      );
    }

    return (
      <span className={textColorClass}>
        <span className="text-base me-1">{arrowIcon}</span>
        {content}
      </span>
    );
  }

  if (showOnZero) {
    if (asBadge) {
      return (
        <Badge
          variant="neutral"
          size={badgeSm ? 'sm' : undefined}
          tone="outline"
        >
          0{unit}
        </Badge>
      );
    }
    return <span>0{unit}</span>;
  }

  return null;
};
