import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface ProviderOfferingDataCardProps {
  title: string;
  icon?: string | ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export const ProviderOfferingDataCard: FC<ProviderOfferingDataCardProps> = (
  props,
) => {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-4">
            {typeof props.icon === 'string' ? (
              <i className={`${props.icon} fs-1 text-dark`}></i>
            ) : (
              props.icon
            )}
            <h3 className="mb-0">{props.title}</h3>
          </div>
          {props.actions && (
            <div className="flex-grow-1 justify-content-end d-flex gap-2">
              {props.actions}
            </div>
          )}
        </div>
        <div className="flex-grow-1">{props.children}</div>
        <div>{props.footer}</div>
      </Card.Body>
    </Card>
  );
};
