import { FC } from 'react';

interface PricingPlanDetailsListProps {
  items: Array<{
    title: string;
    value: string;
  }>;
  className?: string;
}

export const PricingPlanDetailsList: FC<PricingPlanDetailsListProps> = ({
  items,
  className = '',
}) => {
  return (
    <ul className={`pricing-plan-details-list ${className}`}>
      {items.map((item, i) => (
        <li key={i}>
          <i className="dot fa fa-circle text-dark me-2" />
          <span>
            {item.title}
            {': '}
            <span className="fw-bold">{item.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};
