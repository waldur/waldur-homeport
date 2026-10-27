import { CheckFatIcon, WarningIcon } from '@phosphor-icons/react';

export const ValidationIcon = ({ value }) =>
  value ? (
    <CheckFatIcon size={18} weight="fill" className="text-success me-1.5" />
  ) : (
    <WarningIcon size={18} weight="fill" className="text-danger me-1.5" />
  );
