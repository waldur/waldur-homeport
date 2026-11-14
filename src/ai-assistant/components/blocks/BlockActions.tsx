import { ThreadPrimitive } from '@assistant-ui/react';
import classNames from 'classnames';
import { ComponentPropsWithoutRef, FC, forwardRef, ReactNode } from 'react';

export const BlockActions: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={classNames('flex gap-3.5 pt-6 pb-2.5', className)}>
    {children}
  </div>
);

export interface BlockActionButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary';
  prompt?: string;
}

export const BlockActionButton = forwardRef<
  HTMLButtonElement,
  BlockActionButtonProps
>(
  (
    {
      variant = 'secondary',
      prompt,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const button = (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classNames(
          'inline-flex items-center gap-2 py-2 px-4 text-sm font-medium rounded-lg border cursor-pointer transition-all duration-200',
          '[&>svg]:shrink-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          variant === 'primary'
            ? 'border-brand-subtle bg-[var(--btn-secondary-bg)] text-[var(--text-brand-primary)] [&>svg]:text-[var(--btn-secondary-icon)] hover:bg-[var(--btn-secondary-bg-hover)] hover:scale-[1.02] active:translate-y-0 disabled:hover:bg-[var(--btn-secondary-bg)]'
            : 'border-primary bg-primary text-secondary [&>svg]:text-quaternary hover:bg-primary-hover hover:scale-[1.02] active:translate-y-0 disabled:hover:bg-primary',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );

    if (!prompt || disabled) {
      return button;
    }

    return (
      <ThreadPrimitive.Suggestion
        prompt={prompt}
        send
        clearComposer={false}
        asChild
      >
        {button}
      </ThreadPrimitive.Suggestion>
    );
  },
);
BlockActionButton.displayName = 'BlockActionButton';
