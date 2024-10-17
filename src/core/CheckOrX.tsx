import { Check, X } from '@phosphor-icons/react';

export const CheckOrX = ({ value }) =>
  value ? (
    <Check weight="bold" className="text-info" />
  ) : (
    <X weight="bold" className="text-danger" />
  );
