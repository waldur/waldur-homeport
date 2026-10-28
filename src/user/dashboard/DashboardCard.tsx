import { FC, ReactNode } from 'react';

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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`card card-bordered ${
        isClickable ? 'hover:border-brand cursor-pointer' : 'opacity-50'
      }`}
      onClick={isClickable ? onClick : undefined}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        minHeight: '120px',
      }}
    >
      <div className="card-body flex items-center">
        <div
          className={`size-[50px] me-3 shrink-0 rounded-md flex items-center justify-center ${
            isClickable ? backgroundColor : 'bg-gray-300 dark:bg-gray-dark-600'
          }`}
        >
          {icon}
        </div>
        <div className="grow">
          <div className="card-title mb-1 h5">{title}</div>
          <p className="text-quaternary mb-0 text-xs">{message}</p>
        </div>
      </div>
    </div>
  );
};
