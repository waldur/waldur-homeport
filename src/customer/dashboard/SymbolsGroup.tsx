import { FC } from 'react';
import { User } from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { Tip } from '@waldur/core/Tooltip';

interface SymbolsGroupProps {
  items: object[];
  max?: number;
  nameKey?: string;
  emailKey?: string;
  imageKey?: string;
  length?: number;
  size?: number;
  onClick?(): void;
}

const colorClasses = [
  'bg-primary text-inverse-primary',
  'bg-warning text-inverse-warning',
  'bg-success text-inverse-success',
  'bg-danger text-inverse-danger',
  'bg-dark text-inverse-dark',
  'bg-info text-inverse-info',
];

const getSymbolColorClass = (index: number) => {
  return colorClasses[index % colorClasses.length];
};

export const SymbolsGroup: FC<SymbolsGroupProps> = ({
  max = 8,
  nameKey = 'full_name',
  emailKey = 'email',
  imageKey = 'image',
  items,
  length,
  size = 35,
  onClick,
}) => (
  <div
    className="symbol-group symbol-hover"
    onClick={onClick}
    onKeyPress={(e) => e.key === 'Enter' && onClick()}
    role="button"
    tabIndex={0}
  >
    {items.slice(0, max).map((item: User, index: number) => (
      <div key={index} className={`symbol symbol-circle symbol-${size}px`}>
        <Tip key={index} label={item[nameKey]} id={`customer-${index}`}>
          {item[imageKey] || item[nameKey] ? (
            <Avatar
              size={size}
              src={item[imageKey]}
              name={item[nameKey]}
              circle
            />
          ) : (
            <div
              className={`symbol-label fs-4 fw-bold ${getSymbolColorClass(
                index,
              )}`}
            >
              {item[emailKey] ? item[emailKey][0].toUpperCase() : '?'}
            </div>
          )}
        </Tip>
      </div>
    ))}
    {(length ?? items.length) > max && (
      <div className={`symbol symbol-circle symbol-${size}px`}>
        <div className="symbol-label fs-5 fw-bold bg-secondary text-primary-600">
          +{length ? Math.max(length - max, 0) : items.slice(max).length}
        </div>
      </div>
    )}
  </div>
);
