import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

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
    <SubmitButton
      submitting={false}
      type="button"
      onClick={loadData}
      label={translate('Reload')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  </div>
);
