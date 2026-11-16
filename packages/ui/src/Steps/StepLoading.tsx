import { FC } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { LoadingSpinner } from '../LoadingSpinner';

interface StepLoadingProps {
  message?: string;
  className?: string;
}

export const StepLoading: FC<StepLoadingProps> = ({ message, className }) => (
  <div className={cn('text-center py-10', className)}>
    <LoadingSpinner
      size={32}
      className="text-brand inline-block"
      aria-label={message || translate('Loading...')}
    />
    {message && <p className="mt-4">{message}</p>}
  </div>
);
