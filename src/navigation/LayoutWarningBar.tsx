import { WarningCircleIcon, WarningOctagonIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { FeaturedIcon } from 'waldur-ui';

import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

type LayoutWarningBarVariant = 'warning' | 'danger';

interface LayoutWarningBarProps {
  variant?: LayoutWarningBarVariant;
  /** Bold lead-in before the message. Callers supply their own punctuation
   *  (e.g. "Project removed:"), since not every bar uses a colon. */
  title?: ReactNode;
  /** Message body, rendered after the title. */
  children?: ReactNode;
  /** Right-aligned actions, usually a single small BaseButton. */
  actions?: ReactNode;
  /** Leading icon. Defaults to the variant's status icon; pass `null` to hide it. */
  icon?: ReactNode;
  /** Centre the message (the permission banner, which has no icon or actions). */
  centered?: boolean;
  /** Extra classes for the inner content row. */
  className?: string;
}

const VARIANT_CLASSES: Record<LayoutWarningBarVariant, string> = {
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

const DEFAULT_ICONS: Record<LayoutWarningBarVariant, ReactNode> = {
  warning: <WarningCircleIcon weight="bold" />,
  danger: <WarningOctagonIcon weight="bold" />,
};

/**
 * Full-width status strip shown under the top bar (project removed, grace
 * period, pending offering accounts, limited/restricted permissions).
 * Rendered by Layout.tsx; one bar per condition, stacked flush.
 */
export const LayoutWarningBar: FC<LayoutWarningBarProps> = ({
  variant = 'warning',
  title,
  children,
  actions,
  icon,
  centered,
  className,
}) => {
  const iconNode = icon === undefined ? DEFAULT_ICONS[variant] : icon;

  return (
    <div
      className={classNames(
        'flex min-h-12 items-center border-b border-secondary',
        VARIANT_CLASSES[variant],
      )}
      data-variant={variant}
    >
      <div
        className={classNames(
          PAGE_CONTAINER_CLASSNAME,
          'flex w-full items-center gap-1.5',
          centered && 'justify-center text-center',
          className,
        )}
      >
        {iconNode ? (
          <FeaturedIcon icon={iconNode} variant={variant} size="sm" />
        ) : null}
        <p
          className={classNames(
            'mb-0 py-1.5 text-sm',
            centered ? 'text-center' : 'text-start',
          )}
        >
          {title ? <strong className="font-bold">{title}</strong> : null}
          {title && children ? ' ' : null}
          {children}
        </p>
        {actions ? (
          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
};
