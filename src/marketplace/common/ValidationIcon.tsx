import { CheckFat, Warning } from '@phosphor-icons/react';

export const ValidationIcon = ({ value }) =>
  value ? (
    <CheckFat size={18} weight="fill" className="text-success me-2" />
  ) : (
    <Warning size={18} weight="fill" className="text-danger me-2" />
  );
