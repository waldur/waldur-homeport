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
      <Card.Body className="d-flex align-items-center">
        <div className="symbol symbol-50px me-4 flex-shrink-0">
          <div
            className={`symbol-label ${isClickable ? backgroundColor : 'bg-gray-300'}`}
          >
            {icon}
          </div>
        </div>
        <div className="flex-grow-1">
          <Card.Title className="mb-1 h5">{title}</Card.Title>
          <p className="text-muted mb-0 fs-7">{message}</p>
        </div>
      </Card.Body>
    </Card>
  );
};
