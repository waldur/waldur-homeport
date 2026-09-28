import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton, Badge, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

interface SaveButtonProps {
  submitting?: boolean;
  dirty?: boolean;
  type?: 'button' | 'submit';
  onClick?: (event?: any) => void;
  className?: string;
}

export const SaveButton: FC<SaveButtonProps> = ({
  submitting,
  dirty,
  className,
  type,
  onClick,
}) => {
  const button = (
    <div className="position-relative">
      <BaseButton
        className={`min-w-80px ${className || ''}`.trim()}
        variant={dirty ? 'warning' : 'primary'}
        disabled={submitting}
        disabledReason={translate('Saving...')}
        size="lg"
        type={type}
        onClick={onClick}
        iconNode={<CheckCircleIcon weight="bold" />}
        label={submitting ? translate('Saving...') : translate('Save')}
      />
      {dirty && (
        <Badge
          variant="warning"
          shape="circle"
          tone="solid"
          className="position-absolute top-0 start-100 translate-middle"
        >
          !
        </Badge>
      )}
    </div>
  );

  if (dirty) {
    return (
      <Tooltip side="bottom" label={translate('You have unsaved changes')}>
        {button}
      </Tooltip>
    );
  }

  return button;
};
