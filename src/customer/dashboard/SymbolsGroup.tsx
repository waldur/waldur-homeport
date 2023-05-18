import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';

import { Tip } from '@waldur/core/Tooltip';

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
  imageKey,
  length,
  onClick,
}) => (
  <div className="symbol-group symbol-hover" onClick={onClick}>
    {items.slice(0, max).map((item, index) => (
      <div key={index} className="symbol symbol-circle symbol-35px">
        <Tip key={index} label={item[nameKey]} id={`customer-${index}`}>
          {item[imageKey] ? (
            <img src={item[imageKey]} className="rounded-circle" />
          ) : item[emailKey] ? (
            <Gravatar
              email={item[emailKey]}
              size={35}
              className="rounded-circle"
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
