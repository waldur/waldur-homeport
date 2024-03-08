import { FunctionComponent } from 'react';

import Avatar from '@waldur/core/Avatar';
import { Tip } from '@waldur/core/Tooltip';
import { User } from '@waldur/workspace/types';

interface SymbolsGroupProps {
  items: Object[];
  max?: number;
  nameKey?: string;
  emailKey?: string;
  imageKey?: string;
  length?: number;
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

export const SymbolsGroup: FunctionComponent<SymbolsGroupProps> = ({
  items,
  max,
  nameKey,
  emailKey,
  length,
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
      <div key={index} className="symbol symbol-circle symbol-35px">
        <Tip key={index} label={item[nameKey]} id={`customer-${index}`}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.image}
              className="rounded-circle w-35px h-35px"
            />
          ) : item[emailKey] ? (
            <Avatar className="rounded-circle" name={item[nameKey]} />
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
      <div className="symbol symbol-circle symbol-35px">
        <div className="symbol-label fs-6 fw-bold bg-dark text-inverse-dark">
          +{length ? Math.max(length - max, 0) : items.slice(max).length}
        </div>
      </div>
    )}
  </div>
);

SymbolsGroup.defaultProps = {
  max: 8,
  nameKey: 'full_name',
  emailKey: 'email',
  imageKey: 'imageUrl',
};
