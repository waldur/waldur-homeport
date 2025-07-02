import { CheckIcon, XIcon } from '@phosphor-icons/react';

export const CheckOrX = ({ value }) =>
  value ? (
    <CheckIcon weight="bold" className="text-info" />
  ) : (
    <XIcon weight="bold" className="text-danger" />
  );
