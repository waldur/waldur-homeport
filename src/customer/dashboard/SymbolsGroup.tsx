import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';

import { Tip } from '@waldur/core/Tooltip';

interface SymbolItem {
  email?: string;
  full_name?: string;
  imageUrl?: string;
}

interface SymbolsGroupProps {
  items: SymbolItem[];
  max?: number;
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
}) => (
  <div className="symbol-group symbol-hover">
    {items.slice(0, max).map((item, index) => (
      <div key={index} className="symbol symbol-circle symbol-35px">
        <Tip key={index} label={item.full_name} id={`customer-${index}`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} className="rounded-circle" />
          ) : item.email ? (
            <Gravatar email={item.email} size={35} className="rounded-circle" />
          ) : (
            <div
              className={`symbol-label fs-4 fw-bold ${getSymbolColorClass(
                index,
              )}`}
            >
              {item.email ? item.email[0].toUpperCase() : '?'}
            </div>
          )}
        </Tip>
      </div>
    ))}
    {items.length > max && (
      <div className="symbol symbol-circle symbol-35px">
        <div className="symbol-label fs-6 fw-bold bg-dark text-inverse-dark">
          +{items.slice(max).length}
        </div>
      </div>
    )}
  </div>
);

SymbolsGroup.defaultProps = {
  max: 8,
};
