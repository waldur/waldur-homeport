import { FC } from 'react';

interface ChangesAmountBadgeProps {
  changes: number;
  showOnInfinity?: boolean;
  showOnZero?: boolean;
  fractionDigits?: number;
  asBadge?: boolean;
  unit?: string;
}
export const ChangesAmountBadge: FC<ChangesAmountBadgeProps> = ({
  changes,
  showOnInfinity,
  showOnZero,
  fractionDigits = 2,
  asBadge = true,
  unit = '%',
}) => {
  let className = asBadge ? 'badge badge-light-' : 'text-';
  const arrowClassName = asBadge ? '' : 'fs-4';

  if (changes !== 0 && !Number.isNaN(changes)) {
    if (changes < 0) {
      className += 'danger';
    } else {
      className += 'success';
    }
  } else {
    className += 'warning';
  }

  return changes === undefined && changes !== 0 && !Number.isNaN(changes) ? (
    changes < 0 ? (
      changes !== -Infinity ? (
        <span className={className}>
          <span className={arrowClassName}>↓</span>{' '}
          {Math.abs(changes).toFixed(fractionDigits)}
          {unit}
        </span>
      ) : showOnInfinity ? (
        <span className={className + ' ' + arrowClassName}>↓</span>
      ) : null
    ) : changes !== Infinity ? (
      <span className={className}>
        <span className={arrowClassName}>↑</span>{' '}
        {changes?.toFixed(fractionDigits)}
        {unit}
      </span>
    ) : showOnInfinity ? (
      <span className={className + ' ' + arrowClassName}>↑</span>
    ) : null
  ) : showOnZero ? (
    <span className={className}>0{unit}</span>
  ) : null;
};
