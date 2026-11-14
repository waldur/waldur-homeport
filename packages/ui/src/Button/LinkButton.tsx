import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '../cn';

export const linkButtonVariants = cva(
  'bg-transparent border-0 p-0 m-0 inline cursor-pointer text-start transition-colors disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        brand:
          'text-brand-secondary hover:underline disabled:text-[var(--text-disabled)] disabled:no-underline',
        danger:
          'text-danger hover:underline disabled:text-[var(--text-disabled)] disabled:no-underline',
        subtle:
          'text-primary underline hover:text-brand-secondary hover:no-underline disabled:text-[var(--text-disabled)] disabled:no-underline',
      },
      size: {
        sm: 'text-sm',
        inherit: '',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'sm',
    },
  },
);

export interface LinkButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof linkButtonVariants> {}

/**
 * LinkButton - A semantic <button type="button"> that renders visually as an
 * inline hyperlink.
 *
 * Use LinkButton for user actions (triggers, modal openers, "Show more", "Try again")
 * that live inline within prose or sentences. Use Link for real navigation.
 */
export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ className, variant, size, type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(linkButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);
LinkButton.displayName = 'LinkButton';
