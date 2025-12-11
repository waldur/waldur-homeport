import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

interface ChangesAmountBadgeProps {
  changes: number;
  showOnInfinity?: boolean;
  showOnZero?: boolean;
  showSign?: boolean;
  fractionDigits?: number;
  /** Render changes number as it is */
  keepDecimals?: boolean;
  asBadge?: boolean;
  badgeOutline?: boolean;
  badgePill?: boolean;
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
  badgeOutline,
  badgePill,
  badgeSm,
  reverseColor,
  unit = '%',
}) => {
  let className = asBadge
    ? `badge${badgePill ? ' badge-pill' : ''}${badgeSm ? ' badge-sm' : ''} badge-${badgeOutline ? 'outline' : 'light'}-`
    : 'text-';
  const arrowClassName = asBadge ? '' : 'fs-4';

  if (typeof changes === 'string') {
    changes = parseFloat(changes);
  }

  if (changes !== 0 && !Number.isNaN(changes)) {
    if (changes < 0) {
      className += reverseColor ? 'success' : 'danger';
    } else {
      className += reverseColor ? 'danger' : 'success';
    }
  } else {
    className += 'default';
  }

  const renderNumber = (num) =>
    keepDecimals ? num : num.toFixed?.(fractionDigits);

  return changes === undefined || (changes !== 0 && !Number.isNaN(changes)) ? (
    changes < 0 ? (
      changes !== -Infinity ? (
        <span className={classNames(className, 'has-left-icon')}>
          <span className={classNames(arrowClassName, 'left-icon')}>
            <ArrowDownIcon weight="bold" />
          </span>{' '}
          {showSign && '-'}
          {renderNumber(Math.abs(changes))}
          {unit}
        </span>
      ) : showOnInfinity ? (
        <span className={classNames(className, arrowClassName, 'badge-icon')}>
          <ArrowDownIcon weight="bold" />
        </span>
      ) : null
    ) : changes !== Infinity ? (
      <span className={classNames(className, 'has-left-icon')}>
        <span className={classNames(arrowClassName, 'left-icon')}>
          <ArrowUpIcon weight="bold" />
        </span>{' '}
        {showSign && '+'}
        {renderNumber(changes)}
        {unit}
      </span>
    ) : showOnInfinity ? (
      <span className={classNames(className, arrowClassName, 'badge-icon')}>
        <ArrowUpIcon weight="bold" />
      </span>
    ) : null
  ) : showOnZero ? (
    <span className={className}>0{unit}</span>
  ) : null;
};
