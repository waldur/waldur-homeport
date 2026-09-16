import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

import { Badge, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

interface SaveButtonProps extends Omit<ButtonProps, 'variant' | 'children'> {
  submitting?: boolean;
  dirty?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const SaveButton: FC<SaveButtonProps> = ({
  submitting,
  dirty,
  className = '',
  ...rest
}) => {
  const button = (
    <div className="position-relative">
      <Button
        className={`min-w-80px ${className}`.trim()}
        variant={dirty ? 'warning' : 'primary'}
        disabled={submitting}
        size="lg"
        {...rest}
      >
        <span className="svg-icon svg-icon-2">
          <CheckCircleIcon weight="bold" />
        </span>
        {submitting ? translate('Saving...') : translate('Save')}
      </Button>
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
