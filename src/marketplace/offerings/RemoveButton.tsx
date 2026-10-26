import { XIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface RemoveButtonProps {
  onClick(): void;
  className?: string;
}

export const RemoveButton = ({ onClick, className }: RemoveButtonProps) => (
  <BaseButton
    variant="tertiary-ghost"
    size="sm"
    iconNode={<XIcon weight="bold" />}
    aria-label={translate('Remove')}
    onClick={onClick}
    className={className}
  />
);
