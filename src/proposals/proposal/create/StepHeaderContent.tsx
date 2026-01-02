import { CheckCircle, Circle } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

interface StepHeaderContentProps {
  isCompleted: boolean;
  metadata?: ReactNode;
  isRequired?: boolean;
}

export const StepHeaderContent: FC<StepHeaderContentProps> = ({
  isCompleted,
  metadata,
  isRequired = true,
}) => (
  <div className="d-flex align-items-center gap-2">
    {metadata && (
      <span className="text-muted fw-semibold fs-7">{metadata}</span>
    )}
    {isCompleted ? (
      <CheckCircle weight="bold" className="text-success" size={20} />
    ) : isRequired ? (
      <Circle weight="bold" className="text-muted" size={20} />
    ) : null}
  </div>
);
