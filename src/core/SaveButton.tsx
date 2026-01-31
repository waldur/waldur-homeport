import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, ButtonProps, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

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
        <span className="position-absolute top-0 start-100 translate-middle badge badge-circle badge-warning">
          !
        </span>
      )}
    </div>
  );

  if (dirty) {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="save-button-tip">
            {translate('You have unsaved changes')}
          </Tooltip>
        }
      >
        {button}
      </OverlayTrigger>
    );
  }

  return button;
};
