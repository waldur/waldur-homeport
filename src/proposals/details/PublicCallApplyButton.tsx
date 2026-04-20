import { FC } from 'react';
import { Variant } from 'react-bootstrap/types';
import { ProtectedRound } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { Call } from '../types';

import { usePublicCallApply } from './usePublicCallApply';

interface PublicCallApplyButtonProps {
  call: Call;
  round?: ProtectedRound;
  title?: string;
  variant?: Variant;
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
  const { activeRound, hidden, handleApply } = usePublicCallApply(call, round);

  if (hidden) return null;

  return (
    <SubmitButton
      submitting={false}
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleApply}
      label={title}
      disabled={!activeRound}
      disabledReason={
        !activeRound
          ? translate('No open or scheduled round available.')
          : undefined
      }
    />
  );
};
