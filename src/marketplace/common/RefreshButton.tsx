import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import classNames from 'classnames';

import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';

interface RefreshButtonProps {
  size?: 'sm' | 'lg';
  refetch;
  isLoading?: boolean;
  className?: string;
}

export const RefreshButton = ({
  size = 'lg',
  refetch,
  isLoading,
  className,
}: RefreshButtonProps) => {
  const ButtonComponent = size === 'sm' ? CompactSubmitButton : SubmitButton;

  return (
    <ButtonComponent
      submitting={isLoading}
      type="button"
      variant="tertiary"
      className={classNames('min-w-100px', className)}
      onClick={!isLoading ? refetch : undefined}
      label={translate('Refresh')}
      iconNode={<ArrowClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};
