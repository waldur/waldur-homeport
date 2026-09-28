import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface LoadingErredProps {
  loadData: () => void;
  message?: string;
  className?: string;
}

export const LoadingErred: FunctionComponent<LoadingErredProps> = ({
  loadData,
  message,
  className,
}) => (
  <div className={`text-center ${className ?? ''}`}>
    <h3>{message || translate('Unable to load data.')}</h3>
    <BaseButton
      onClick={loadData}
      label={translate('Reload')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  </div>
);
