import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { toast } from 'sonner';

import { AlertItem, AlertItemVariant } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import { IconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';

import './Toast.scss';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  /** Renders in the brand colour; use for the affirmative action. */
  primary?: boolean;
}

interface ToastProps {
  id: string | number;
  title: ReactNode;
  message?: ReactNode;
  variant: AlertItemVariant;
  actions?: ToastAction[];
}

/** A toast: AlertItem in its floating form, so toasts and page alerts stay one component. */
export const Toast: FC<ToastProps> = ({
  id,
  title,
  message,
  variant,
  actions,
}) => {
  const dismiss = () => toast.dismiss(id);
  const hasActions = Boolean(actions?.length);

  return (
    <AlertItem
      className={classNames(
        'toast-item',
        `toast-item-${variant}`,
        'items-start gap-4 rounded-[12px] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)]',
      )}
      iconSize="md"
      iconClassName="-m-[9px]"
      type="floating"
      variant={variant}
      title={title}
      body={
        message || hasActions ? (
          <>
            {message}
            {hasActions && (
              <div className="toast-item-actions">
                {actions.map((action) => (
                  <BaseButton
                    key={action.label}
                    size="sm"
                    variant={action.primary ? 'text-primary' : 'text-secondary'}
                    label={action.label}
                    onClick={() => {
                      action.onClick?.();
                      dismiss();
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : undefined
      }
      actions={
        <IconButton
          className="toast-item-close"
          variant="text-secondary"
          iconNode={<XIcon weight="regular" />}
          tooltip={translate('Dismiss')}
          onClick={dismiss}
        />
      }
    />
  );
};
