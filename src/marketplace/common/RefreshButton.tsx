import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import classNames from 'classnames';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

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
}: RefreshButtonProps) => (
  <BaseButton
    pending={isLoading}
    size={size}
    variant="tertiary"
    className={classNames('min-w-100px', className)}
    onClick={!isLoading ? refetch : undefined}
    label={translate('Refresh')}
    iconNode={<ArrowClockwiseIcon weight="bold" />}
  />
);
