import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface DashboardCardProps {
  title: string;
  message: string;
  icon: ReactNode;
  isLoading: boolean;
  hasItems: boolean;
  backgroundColor: string;
  onClick?: () => void;
}

export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  message,
  icon,
  isLoading,
  hasItems,
  backgroundColor,
  onClick,
}) => {
  const isClickable = !isLoading && hasItems;

  return (
    <Card
      className={`card-bordered ${
        isClickable ? 'card-hover cursor-pointer' : 'opacity-50'
      }`}
      onClick={isClickable ? onClick : undefined}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        minHeight: '120px',
      }}
    >
      <Card.Body className="flex items-center">
        <div className="symbol symbol-50px me-4 shrink-0">
          <div
            className={`symbol-label ${isClickable ? backgroundColor : 'bg-gray-300 dark:bg-gray-dark-600'}`}
          >
            {icon}
          </div>
        </div>
        <div className="grow">
          <Card.Title className="mb-1 h5">{title}</Card.Title>
          <p className="text-quaternary mb-0 text-xs">{message}</p>
        </div>
      </Card.Body>
    </Card>
  );
};
