import { FC } from 'react';

import { LoadingSpinner } from 'waldur-ui';

import { translate } from '@/i18n';

interface StepLoadingProps {
  message?: string;
  className?: string;
}

export const StepLoading: FC<StepLoadingProps> = ({ message, className }) => (
  <div className={`text-center py-10 ${className ?? ''}`.trim()}>
    <LoadingSpinner
      size={32}
      className="text-brand inline-block"
      aria-label={message || translate('Loading...')}
    />
    {message && <p className="mt-4">{message}</p>}
  </div>
);
