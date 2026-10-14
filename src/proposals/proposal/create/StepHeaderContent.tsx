import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';
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
    {metadata && <span className="text-quaternary fs-7">{metadata}</span>}
    {isCompleted ? (
      <CheckCircleIcon weight="bold" className="text-success" size={20} />
    ) : isRequired ? (
      <CircleIcon weight="bold" className="text-quaternary" size={20} />
    ) : null}
  </div>
);
