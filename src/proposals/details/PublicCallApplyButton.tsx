import { FC } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { ButtonVariant, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { Call } from '../types';

import { usePublicCallApply } from './usePublicCallApply';

interface PublicCallApplyButtonProps {
  call: Call;
  round?: ProtectedRound;
  title?: string;
  variant?: ButtonVariant;
  className?: string;
  size?: 'sm' | 'lg';
}

export const PublicCallApplyButton: FC<PublicCallApplyButtonProps> = ({
  call,
  round,
  title = translate('Apply to round'),
  variant = 'primary',
  className,
  size,
}) => {
  const { hidden, handleApply, disabledReason } = usePublicCallApply(
    call,
    round,
  );

  if (hidden) return null;

  return (
    <BaseButton
      variant={variant}
      size={size}
      className={className}
      onClick={handleApply}
      label={title}
      disabled={!!disabledReason}
      disabledReason={disabledReason}
    />
  );
};
